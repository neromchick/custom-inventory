using CustomInventory.Domain.Entities;

namespace CustomInventory.Infrastructure.Repositories
{
    public interface IInventoryRepository
    {
        Task<Inventory> CreateAsync(Inventory inventory);
        Task<bool> DeleteAsync(Guid id);
        Task<List<Inventory>> GetAllAsync();
        Task<Inventory> GetByIdAsync(Guid id);
        Task<Inventory> UpdateAsync(Inventory inventory);
    }
}