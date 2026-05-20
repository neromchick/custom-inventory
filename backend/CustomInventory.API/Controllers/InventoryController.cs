using CustomInventory.API.Extensions;
using CustomInventory.Application.DTOs;
using CustomInventory.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CustomInventory.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryService _service;

        public InventoryController(IInventoryService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAsync()
        {
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            bool isAdmin = User.IsInRole("Admin");

            var inventories = await _service.GetAllAsync(currentUserId, isAdmin);

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
    }
}
