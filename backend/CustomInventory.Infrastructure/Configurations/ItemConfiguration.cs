using CustomInventory.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace CustomInventory.Infrastructure.Configurations
{
    public class ItemConfiguration : IEntityTypeConfiguration<Item>
    {
        public void Configure(EntityTypeBuilder<Item> builder)
        {
            builder.HasIndex(i => new { i.InventoryId, i.Id })
                .IsUnique();
            builder.HasOne(i => i.Inventory)
                .WithMany(inv => inv.Items)
                .HasForeignKey(i => i.InventoryId);
            builder.Property<uint>("xmin")
                .HasColumnType("xid")
                .ValueGeneratedOnAddOrUpdate()
                .IsConcurrencyToken();
        }
    }
}
