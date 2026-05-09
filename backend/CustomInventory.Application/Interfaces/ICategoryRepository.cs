using CustomInventory.Domain.Entities;

namespace CustomInventory.Infrastructure.Repositories
{
    public interface ICategoryRepository
    {
        Task<Category> CreateAsync(Category category);
        Task<bool> DeleteAsync(int id);
        Task<List<Category>> GetAllAsync();
    }
}