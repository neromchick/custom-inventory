using CustomInventory.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CustomInventory.API.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IUserService _service;

        public AdminController(IUserService service)
        {
            _service = service;
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsersAsync()
        {
            var users = await _service.GetAllAsync();
            return Ok(users);
        }

        [HttpPost("users/{id}/block")]
        public async Task<IActionResult> BlockUserAsync(string id)
        {
            var result = await _service.BlockAsync(id);
            return result ? Ok() : NotFound();
        }

        [HttpPost("users/{id}/unblock")]
        public async Task<IActionResult> UnblockUserAsync(string id)
        {
            var result = await _service.UnblockAsync(id);
            return result ? Ok() : NotFound();
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUserAsync(string id)
        {
            var result = await _service.DeleteAsync(id);
            return result ? Ok() : NotFound();
        }

        [HttpPost("users/{id}/make-admin")]
        public async Task<IActionResult> MakeAdminAsync(string id)
        {
            var result = await _service.MakeAdminAsync(id);
            return result ? Ok() : NotFound();
        }

        [HttpPost("users/{id}/remove-admin")]
        public async Task<IActionResult> RemoveAdminAsync(string id)
        {
            var result = await _service.RemoveAdminAsync(id);
            return result ? Ok() : NotFound();
        }
    }
}