using System;
using System.Collections.Generic;
using System.Text;

namespace CustomInventory.Domain.Entities
{
    internal class Category
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public Category(string name)
        {
            Name = name;
        }
    }
}
