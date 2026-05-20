using CustomInventory.Domain.Entities;
using CustomInventory.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CustomInventory.Infrastructure.Repositories
{
    public class InventoryRepository : IInventoryRepository
    {
        private readonly AppDbContext _context;
        public InventoryRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Inventory>> GetAllAsync(string? currentUserId, bool isAdmin)
        {
            var query = _context.Inventories.AsQueryable();

            if (!isAdmin)
                query = query.Where(i => i.IsPublic || i.CreatorId == currentUserId);

            return await query
                .Include(i => i.Category)
                .ToListAsync();
        }

        public async Task<Inventory?> GetByIdAsync(Guid id)
        {
            return await _context.Inventories
                .Include(i => i.Category)
                .FirstOrDefaultAsync(i => i.Id == id);
        }

        public async Task<List<Inventory>> GetByUserIdAsync(string userId)
        {
            return await _context.Inventories
                .Where(i => i.CreatorId == userId)
                .Include(i => i.Category)
                .ToListAsync();
        }

        public async Task<Inventory> CreateAsync(Inventory inventory)
        {
            _context.Inventories.Add(inventory);
            await _context.SaveChangesAsync();
            return inventory;
        }

        public async Task<Inventory> UpdateAsync(Inventory inventory)
        {
            _context.Inventories.Update(inventory);
            await _context.SaveChangesAsync();
            return inventory;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var inventory = await _context.Inventories.FirstOrDefaultAsync(i => i.Id == id);
            if (inventory == null) return false;
            _context.Inventories.Remove(inventory);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
