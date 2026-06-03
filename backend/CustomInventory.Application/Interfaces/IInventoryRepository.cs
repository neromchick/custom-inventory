using CustomInventory.Domain.Entities;

namespace CustomInventory.Application.Interfaces
{
    public interface IInventoryRepository
    {
        Task<Inventory> CreateAsync(Inventory inventory);
        Task<bool> DeleteAsync(Guid id);
        Task<List<Inventory>> GetAllAsync(string? currentUserId, bool isAdmin, int page, int pageSize);
        Task<Inventory?> GetByIdAsync(Guid id);
        Task<List<Inventory>> GetByUserIdAsync(string userId);
        Task<Inventory> UpdateAsync(Inventory inventory);
    }
}