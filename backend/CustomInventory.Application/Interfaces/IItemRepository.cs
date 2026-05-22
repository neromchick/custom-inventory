using CustomInventory.Domain.Entities;

namespace CustomInventory.Application.Repositories
{
    public interface IItemRepository
    {
        Task<Item> CreateAsync(Item item);
        Task<bool> DeleteAsync(Guid inventoryId, Guid id);
        Task<List<Item>> GetAllAsync(Guid inventoryId);
        Task<Item?> GetByIdAsync(Guid inventoryId, Guid id);
        Task<Item?> UpdateAsync(Item item);
    }
}