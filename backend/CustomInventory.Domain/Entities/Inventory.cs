using System;
using System.Collections.Generic;
using System.Text;

namespace CustomInventory.Domain.Entities
{
    internal class Inventory
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public Category Category { get; set; }
        public string[] Tags { get; set; }

        public Inventory(string title, string description, int categoryId, string[] tags)
        {
            Title = title;
            Description = description;
            CategoryId = categoryId;
            Tags = tags;
        }
    }
}
