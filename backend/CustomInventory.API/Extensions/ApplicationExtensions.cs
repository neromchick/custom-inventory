using CustomInventory.Application.Interfaces;
using CustomInventory.Application.Mappings;
using CustomInventory.Application.Services;
using CustomInventory.Infrastructure.Repositories;
using CustomInventory.Infrastructure.Services;

namespace CustomInventory.API.Extensions
{
    public static class ApplicationExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<IInventoryRepository, InventoryRepository>();
            services.AddScoped<IInventoryService, InventoryService>();
            services.AddScoped<IItemRepository, ItemRepository>();
            services.AddScoped<IItemService, ItemService>();
            services.AddScoped<ICategoryRepository, CategoryRepository>();
            services.AddScoped<ICategoryService, CategoryService>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IJwtTokenService, JwtTokenService>();
            services.AddScoped<IUserService, UserService>();
            services.AddAutoMapper(cfg => { }, typeof(InventoryProfile).Assembly);
            return services;
        }
    }
}
