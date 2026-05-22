using AutoMapper;
using CustomInventory.Application.DTOs;
using CustomInventory.Application.Interfaces;
using CustomInventory.Domain.Entities;
using Microsoft.EntityFrameworkCore;


namespace CustomInventory.Application.Services
{
    public class InventoryService : IInventoryService
    {
        private readonly IInventoryRepository _repository;
        private readonly IMapper _mapper;

        public InventoryService(IInventoryRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<List<InventoryResponseDto>> GetAllAsync(string? currentUserId, bool isAdmin)
        {
            var inventories = await _repository.GetAllAsync(currentUserId, isAdmin);
            return _mapper.Map<List<InventoryResponseDto>>(inventories);
        }

        public async Task<InventoryResponseDto> GetByIdAsync(Guid id, string? currentUserId, bool isAdmin)
        {
            var inventory = await _repository.GetByIdAsync(id);

            if (!inventory!.IsPublic && inventory.CreatorId != currentUserId && !isAdmin)
                throw new UnauthorizedAccessException("This inventory is private.");

            return _mapper.Map<InventoryResponseDto>(inventory);
        }

        public async Task<List<InventoryResponseDto>> GetByUserIdAsync(string userId)
        {
            var inventories = await _repository.GetByUserIdAsync(userId);

            return _mapper.Map<List<InventoryResponseDto>>(inventories);
        }

        public async Task<InventoryResponseDto> CreateAsync(CreateInventoryDto dto, string creatorId)
        {
            var inventory = _mapper.Map<Inventory>(dto);

            inventory.Id = Guid.NewGuid();
            inventory.CreatorId = creatorId;
            inventory.CreatedAt = DateTime.UtcNow;
            inventory.UpdatedAt = DateTime.UtcNow;

            await _repository.CreateAsync(inventory);

            return _mapper.Map<InventoryResponseDto>(inventory);
        }

        public async Task<InventoryResponseDto?> UpdateAsync(Guid id, CreateInventoryDto dto, string currentUserId, bool isAdmin)
        {
            var inventory = await _repository.GetByIdAsync(id);
            if (inventory == null) return null;

            if (inventory.CreatorId != currentUserId && !isAdmin)
            {
                throw new UnauthorizedAccessException("Недостаточно прав для редактирования");
            }

            _mapper.Map(dto, inventory);
            inventory.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateAsync(inventory);

            return _mapper.Map<InventoryResponseDto>(inventory);
        }
        
        public async Task<bool> DeleteAsync(Guid id, string currentUserId, bool isAdmin)
        {
            var inventory = await _repository.GetByIdAsync(id);

            if (inventory == null)
                throw new KeyNotFoundException("Инвентарь не найден");

            if (!isAdmin && inventory.CreatorId != currentUserId)
                throw new UnauthorizedAccessException("Недостаточно прав для удаления инвентаря");

            return await _repository.DeleteAsync(id);
        }
    }
}
