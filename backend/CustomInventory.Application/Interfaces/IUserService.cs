using CustomInventory.Application.DTOs;

namespace CustomInventory.Application.Interfaces
{
    public interface IUserService
    {
        Task<List<UserResponseDto>> GetAllAsync();
        Task<bool> BlockAsync(string id);
        Task<bool> UnblockAsync(string id);
        Task<bool> DeleteAsync(string id);
        Task<bool> MakeAdminAsync(string id);
        Task<bool> RemoveAdminAsync(string id);
    }
}