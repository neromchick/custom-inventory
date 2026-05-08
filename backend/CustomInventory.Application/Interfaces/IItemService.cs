using CustomInventory.Application.DTOs;

namespace CustomInventory.Application.Interfaces
{
    public interface IItemService
    {
        Task<ItemResponseDto> CreateAsync(Guid inventoryId, CreateItemDto dto, string creatorId);
        Task<bool> DeleteAsync(Guid inventoryId, Guid id);
        Task<List<ItemResponseDto>> GetAllAsync(Guid inventoryId);
        Task<ItemResponseDto?> GetByIdAsync(Guid inventoryId, Guid id);
        Task<ItemResponseDto?> UpdateAsync(Guid inventoryId, Guid id, CreateItemDto dto);
    }
}