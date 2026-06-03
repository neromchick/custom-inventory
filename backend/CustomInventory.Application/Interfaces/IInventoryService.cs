using CustomInventory.Application.DTOs;

namespace CustomInventory.Application.Interfaces
{
    public interface IInventoryService
    {
        Task<InventoryResponseDto> CreateAsync(CreateInventoryDto dto, string creatorId);
        Task<bool> DeleteAsync(Guid id, string currentUserId, bool isAdmin);
        Task<List<InventoryResponseDto>> GetAllAsync(string? currentUserId, bool isAdmin, int page, int pageSize);
        Task<InventoryResponseDto> GetByIdAsync(Guid id, string? currentUserId, bool isAdmin);
        Task<List<InventoryResponseDto>> GetByUserIdAsync(string userId);
        Task<InventoryResponseDto?> UpdateAsync(Guid id, CreateInventoryDto dto, string currentUserId, bool isAdmin);
    }
}