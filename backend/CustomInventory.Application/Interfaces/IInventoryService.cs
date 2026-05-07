using CustomInventory.Application.DTOs;

namespace CustomInventory.Application.Interfaces
{
    public interface IInventoryService
    {
        Task<InventoryResponseDto> CreateAsync(CreateInventoryDto dto, string creatorId);
        Task<bool> DeleteAsync(Guid id);
        Task<List<InventoryResponseDto>> GetAllAsync();
        Task<InventoryResponseDto> GetByIdAsync(Guid id);
        Task<InventoryResponseDto?> UpdateAsync(Guid id, CreateInventoryDto dto);
    }
}