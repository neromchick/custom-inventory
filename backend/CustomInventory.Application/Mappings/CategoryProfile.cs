using AutoMapper;
using CustomInventory.Application.DTOs;
using CustomInventory.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace CustomInventory.Application.Mappings
{
    public class CategoryProfile : Profile
    {
        public CategoryProfile()
        {
            CreateMap<CreateCategoryDto, Category>();
            CreateMap<Category, CategoryResponseDto>();
        }
    }
}
