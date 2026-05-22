using CustomInventory.Domain.Entities;

namespace CustomInventory.Application.Repositories
{
    public interface IInventoryRepository
    {
        Task<Inventory> CreateAsync(Inventory inventory);
        Task<bool> DeleteAsync(Guid id);
        Task<List<Inventory>> GetAllAsync(string? currentUserId, bool isAdmin);
        Task<Inventory?> GetByIdAsync(Guid id);
        Task<List<Inventory>> GetByUserIdAsync(string userId);
        Task<Inventory> UpdateAsync(Inventory inventory);
    }
}