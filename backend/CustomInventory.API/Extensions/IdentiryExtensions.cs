using CustomInventory.Domain.Entities;
using CustomInventory.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;

namespace CustomInventory.API.Extensions
{
    public static class IdentiryExtensions
    {
        public static IServiceCollection AddIdentity(this IServiceCollection services)
        {
            services.AddIdentity<AppUser, IdentityRole>(options =>
            {
                options.Stores.SchemaVersion = IdentitySchemaVersions.Version1;
            })
            .AddEntityFrameworkStores<AppDbContext>()
            .AddDefaultTokenProviders();
            return services;
        }
    }
}
