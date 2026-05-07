using AutoMapper;
using CustomInventory.Application.DTOs;
using CustomInventory.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace CustomInventory.Application.Mappings
{
    public class InventoryProfile : Profile
    {
        public InventoryProfile()
        {
            CreateMap<CreateInventoryDto, Inventory>() //createdto and updatedto is equals
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatorId, opt => opt.Ignore())
                .ForMember(dest => dest.Category, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.Items, opt => opt.Ignore());

            CreateMap<Inventory, InventoryResponseDto>();
        }
    }
}
