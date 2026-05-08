using AutoMapper;
using CustomInventory.Application.DTOs;
using CustomInventory.Application.Interfaces;
using CustomInventory.Domain.Entities;
using CustomInventory.Infrastructure.Repositories;
using System;
using System.Collections.Generic;
using System.Text;

namespace CustomInventory.Application.Services
{
    public class ItemService : IItemService
    {
        private readonly IItemRepository _repository;
        private readonly IMapper _mapper;

        public ItemService(IItemRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<List<ItemResponseDto>> GetAllAsync(Guid inventoryId)
        {
            var items = await _repository.GetAllAsync(inventoryId);
            return _mapper.Map<List<ItemResponseDto>>(items);
        }

        public async Task<ItemResponseDto?> GetByIdAsync(Guid inventoryId, Guid id)
        {
            var item = await _repository.GetByIdAsync(inventoryId, id);
            return item == null ? null : _mapper.Map<ItemResponseDto>(item);
        }

        public async Task<ItemResponseDto> CreateAsync(Guid inventoryId, CreateItemDto dto, string creatorId)
        {
            var item = _mapper.Map<Item>(dto);

            item.Id = Guid.NewGuid();
            item.InventoryId = inventoryId;
            item.CreatorId = creatorId;
            item.CreatedAt = DateTime.Now;
            item.UpdatedAt = DateTime.Now;

            var created = await _repository.CreateAsync(item);

            return _mapper.Map<ItemResponseDto>(created);
        }

        public async Task<ItemResponseDto?> UpdateAsync(Guid inventoryId, Guid id, CreateItemDto dto)
        {
            var item = await _repository.GetByIdAsync(inventoryId, id);
            if (item == null) return null;

            _mapper.Map(dto, item);
            item.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateAsync(item);
            return _mapper.Map<ItemResponseDto>(item);
        }

        public async Task<bool> DeleteAsync(Guid inventoryId, Guid id)
        {
            return await _repository.DeleteAsync(inventoryId, id);
        }
    }
}
