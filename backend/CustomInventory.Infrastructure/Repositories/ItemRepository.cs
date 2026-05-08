using CustomInventory.Domain.Entities;
using CustomInventory.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CustomInventory.Infrastructure.Repositories
{
    public class ItemRepository : IItemRepository
    {
        private readonly AppDbContext _context;

        public ItemRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Item>> GetAllAsync(Guid inventoryId)
        {
            return await _context.Items
                .Where(i => i.InventoryId == inventoryId)
                .ToListAsync();
        }

        public async Task<Item?> GetByIdAsync(Guid inventoryId, Guid id)
        {
            return await _context.Items
                .FirstOrDefaultAsync(i => i.Id == id && i.InventoryId == inventoryId);
        }

        public async Task<Item> CreateAsync(Item item)
        {
            _context.Items.Add(item);
            await _context.SaveChangesAsync();
            return item;
        }

        public async Task<Item?> UpdateAsync(Item item)
        {
            _context.Items.Update(item);
            await _context.SaveChangesAsync();
            return item;
        }

        public async Task<bool> DeleteAsync(Guid inventoryId, Guid id)
        {
            var item = await GetByIdAsync(inventoryId, id);
            if (item == null) return false;

            _context.Items.Remove(item);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
