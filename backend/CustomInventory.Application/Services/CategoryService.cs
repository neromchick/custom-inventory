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
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _repository;
        private readonly IMapper _mapper;

        public CategoryService(ICategoryRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<List<CategoryResponseDto>> GetAllAsync()
        {
            var categories = await _repository.GetAllAsync();
            return _mapper.Map<List<CategoryResponseDto>>(categories);
        }

        public async Task<CategoryResponseDto> CreateAsync(CreateCategoryDto dto)
        {
            var category = _mapper.Map<Category>(dto);

            var created = await _repository.CreateAsync(category);

            return _mapper.Map<CategoryResponseDto>(created);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _repository.DeleteAsync(id);
        }
    }
}
