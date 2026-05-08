using CustomInventory.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CustomInventory.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<Inventory> Inventories => Set<Inventory>();
        public DbSet<Item> Items => Set<Item>();
        public DbSet<Category> Categories => Set<Category>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Item>()
                .HasIndex(i => new { i.InventoryId, i.Id })
                .IsUnique();

            modelBuilder.Entity<Item>()
                .HasOne(i => i.Inventory)
                .WithMany(inv => inv.Items)
                .HasForeignKey(i => i.InventoryId);

            modelBuilder.Entity<Inventory>()
                .Property(i => i.Tags)
                .HasColumnType("text[]");
        }
    }
}