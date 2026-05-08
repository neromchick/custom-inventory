using AutoMapper;
using CustomInventory.Application.DTOs;
using CustomInventory.Domain.Entities;


namespace CustomInventory.Application.Mappings
{
    public class ItemProfile : Profile
    {
        public ItemProfile()
        {
            CreateMap<CreateItemDto, Item>();

            CreateMap<Item, ItemResponseDto>();
        }
    }
}
