using AutoMapper;
using CustomInventory.Application.DTOs;
using CustomInventory.Application.Interfaces;
using CustomInventory.Application.Mappings;
using CustomInventory.Domain.Entities;
using CustomInventory.Infrastructure.Repositories;
using System;
using System.Collections.Generic;
using System.Text;

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

        public async Task<List<InventoryResponseDto>> GetAllAsync()
        {
            var inventories = await _repository.GetAllAsync();
            return _mapper.Map<List<InventoryResponseDto>>(inventories);
        }

        public async Task<InventoryResponseDto> GetByIdAsync(Guid id)
        {
            var inventory = await _repository.GetByIdAsync(id);
            return _mapper.Map<InventoryResponseDto>(inventory);
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

        public async Task<InventoryResponseDto?> UpdateAsync(Guid id, CreateInventoryDto dto)
        {
            var inventory = await _repository.GetByIdAsync(id);
            if (inventory == null) return null;

            _mapper.Map(dto, inventory);
            inventory.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateAsync(inventory);

            return _mapper.Map<InventoryResponseDto>(inventory);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            return await _repository.DeleteAsync(id);
        }
    }
}
