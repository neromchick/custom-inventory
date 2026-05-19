using CustomInventory.Application.DTOs;
using CustomInventory.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CustomInventory.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
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
            var inventories = await _service.GetAllAsync();

            return Ok(inventories);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetByIdAsync(Guid id)
        {
            var inventory = await _service.GetByIdAsync(id);
            if (inventory == null)  return NotFound();

            return Ok(inventory);
        }

        [HttpPost]
        public async Task<IActionResult> CreateAsync(CreateInventoryDto dto)
        {
            var creatorId = "temp-user-id";
            var created = await _service.CreateAsync(dto, creatorId);

            return Ok(created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAsync(Guid id, CreateInventoryDto dto)
        {
            var updated = await _service.UpdateAsync(id, dto);
            if (updated == null) return NotFound();

            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsync(Guid id)
        {
            var result = await _service.DeleteAsync(id);

            return result ? Ok() : NotFound();
        }
    }
}
