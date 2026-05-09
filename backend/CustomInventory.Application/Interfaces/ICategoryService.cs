using CustomInventory.Application.DTOs;

namespace CustomInventory.Application.Interfaces
{
    public interface ICategoryService
    {
        Task<CategoryResponseDto> CreateAsync(CreateCategoryDto dto);
        Task<bool> DeleteAsync(int id);
        Task<List<CategoryResponseDto>> GetAllAsync();
    }
}