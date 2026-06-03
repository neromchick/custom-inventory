using CustomInventory.API.Extensions;
using CustomInventory.Application.DTOs;
using CustomInventory.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text.Json;

namespace CustomInventory.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryService _service;
        private readonly IConfiguration _configuration;
        public InventoryController(IInventoryService service, IConfiguration configuration)
        {
            _service = service;
            _configuration = configuration;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAsync([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            bool isAdmin = User.IsInRole("Admin");

            var inventories = await _service.GetAllAsync(currentUserId, isAdmin, page, pageSize);

            return Ok(inventories);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetByIdAsync(Guid id)
        {
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            bool isAdmin = User.IsInRole("Admin");

            try
            {
                var inventory = await _service.GetByIdAsync(id, currentUserId, isAdmin);

                if (inventory == null) return NotFound();

                return Ok(inventory);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
        }

        [HttpGet("my")]
        [Authorize]
        public async Task<IActionResult> GetMyInventoriesAsync()
        {
            var currentUserId = User.GetUserId(); // Твое расширение
            var inventories = await _service.GetByUserIdAsync(currentUserId);
            return Ok(inventories);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateAsync(CreateInventoryDto dto)
        {
            var creatorId = User.GetUserId();
            var created = await _service.CreateAsync(dto, creatorId);

            return Ok(created);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateAsync(Guid id, CreateInventoryDto dto)
        {
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            bool isAdmin = User.IsInRole("Admin");
            if (string.IsNullOrEmpty(currentUserId)) return Unauthorized();

            try
            {
                var updated = await _service.UpdateAsync(id, dto, currentUserId, isAdmin);
                return Ok(updated);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteAsync(Guid id)
        {
            var currentUserId = User.GetUserId();
            bool isAdmin = User.IsInRole("Admin");

            var result = await _service.DeleteAsync(id, currentUserId, isAdmin);

            return result ? Ok() : NotFound();
        }

        [HttpPost("{id}/support-ticket")]
        [Authorize]
        public async Task<IActionResult> CreateSupportTicket(Guid id, [FromBody] SupportTicketDto dto)
        {
            var currentUserId = User.GetUserId();
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            var userName = User.FindFirst(ClaimTypes.Name)?.Value;
            bool isAdmin = User.IsInRole("Admin");

            var inventory = await _service.GetByIdAsync(id, currentUserId, isAdmin);
            if (inventory == null) return NotFound();

            var sfToken = await GetSalesforceTokenAsync();
            if (sfToken == null) return StatusCode(500, "Salesforce auth failed");

            var accountId = await CreateSalesforceAccountAsync(sfToken.Value, userName ?? "Unknown", userEmail ?? "");
            if (accountId == null) return StatusCode(500, "Failed to create Account");

            await CreateSalesforceContactAsync(sfToken.Value, accountId, userName ?? "Unknown", userEmail ?? "", dto, inventory.Title);

            return Ok(new { message = "Тикет успешно создан в Salesforce", accountId });
        }

        private async Task<(string Token, string InstanceUrl)?> GetSalesforceTokenAsync()
        {
            var clientId = _configuration["Salesforce:ClientId"];
            var clientSecret = _configuration["Salesforce:ClientSecret"];
            var username = _configuration["Salesforce:Username"];
            var password = _configuration["Salesforce:Password"];
            var securityToken = _configuration["Salesforce:SecurityToken"];

            using var http = new HttpClient();
            var content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["grant_type"] = "password",
                ["client_id"] = clientId!,
                ["client_secret"] = clientSecret!,
                ["username"] = username!,
                ["password"] = password! + securityToken!
            });

            var res = await http.PostAsync("https://login.salesforce.com/services/oauth2/token", content);
            if (!res.IsSuccessStatusCode) return null;

            var json = await res.Content.ReadFromJsonAsync<JsonElement>();
            return (json.GetProperty("access_token").GetString()!, json.GetProperty("instance_url").GetString()!);
        }

        private async Task<string?> CreateSalesforceAccountAsync((string Token, string InstanceUrl) sf, string name, string email)
        {
            using var http = new HttpClient();
            http.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", sf.Token);

            var body = JsonSerializer.Serialize(new { Name = name, Website = email });
            var res = await http.PostAsync($"{sf.InstanceUrl}/services/data/v59.0/sobjects/Account",
                new StringContent(body, System.Text.Encoding.UTF8, "application/json"));

            if (!res.IsSuccessStatusCode) return null;
            var json = await res.Content.ReadFromJsonAsync<JsonElement>();
            return json.GetProperty("id").GetString();
        }

        private async Task CreateSalesforceContactAsync((string Token, string InstanceUrl) sf, string accountId, string name, string email, SupportTicketDto dto, string inventoryTitle)
        {
            using var http = new HttpClient();
            http.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", sf.Token);

            var nameParts = name.Split(' ');
            var body = JsonSerializer.Serialize(new
            {
                FirstName = nameParts.Length > 1 ? nameParts[0] : name,
                LastName = nameParts.Length > 1 ? nameParts[1] : "User",
                Email = email,
                AccountId = accountId,
                Description = $"Inventory: {inventoryTitle}\nPriority: {dto.Priority}\nSummary: {dto.Summary}\n{dto.Description}"
            });

            await http.PostAsync($"{sf.InstanceUrl}/services/data/v59.0/sobjects/Contact",
                new StringContent(body, System.Text.Encoding.UTF8, "application/json"));
        }
    }
}
