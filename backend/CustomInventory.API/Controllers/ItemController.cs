using CustomInventory.API.Extensions;
using CustomInventory.Application.DTOs;
using CustomInventory.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CustomInventory.API.Controllers
{
    [ApiController]
    [Route("api/inventories/{inventoryId}/items")]
    public class ItemController : ControllerBase
    {
        private readonly IItemService _service;

        public ItemController(IItemService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAsync(Guid inventoryId)
        {
            var items = await _service.GetAllAsync(inventoryId);
            return Ok(items);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetByIdAsync(Guid inventoryId, Guid id)
        {
            var item = await _service.GetByIdAsync(inventoryId, id);
            return item == null ? NotFound() : Ok(item);
        }

        [HttpPost]
        public async Task<IActionResult> CreateAsync(Guid inventoryId, CreateItemDto dto)
        {
            var creatorId = User.GetUserId();
            var created = await _service.CreateAsync(inventoryId, dto, creatorId);
            return Ok(created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAsync(Guid inventoryId, Guid id, CreateItemDto dto)
        {
            var updated = await _service.UpdateAsync(inventoryId, id, dto);
            return updated == null ? NotFound() : Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsync(Guid inventoryId, Guid id)
        {
            var result = await _service.DeleteAsync(inventoryId, id);
            return result ? Ok() : NotFound();
        }
    }
}
