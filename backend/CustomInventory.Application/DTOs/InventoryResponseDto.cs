using System;
using System.Collections.Generic;
using System.Text;

namespace CustomInventory.Application.DTOs
{
    public class InventoryResponseDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public bool IsPublic { get; set; }
        public int? CategoryId { get; set; }
        public string[] Tags { get; set; } = [];
        public string CreatorId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Custom string fields
        public bool CustomString1State { get; set; }
        public string? CustomString1Name { get; set; }
        public bool CustomString2State { get; set; }
        public string? CustomString2Name { get; set; }
        public bool CustomString3State { get; set; }
        public string? CustomString3Name { get; set; }

        // Custom text fields
        public bool CustomText1State { get; set; }
        public string? CustomText1Name { get; set; }
        public bool CustomText2State { get; set; }
        public string? CustomText2Name { get; set; }
        public bool CustomText3State { get; set; }
        public string? CustomText3Name { get; set; }

        // Custom number fields
        public bool CustomInt1State { get; set; }
        public string? CustomInt1Name { get; set; }
        public bool CustomInt2State { get; set; }
        public string? CustomInt2Name { get; set; }
        public bool CustomInt3State { get; set; }
        public string? CustomInt3Name { get; set; }

        // Custom bool fields
        public bool CustomBool1State { get; set; }
        public string? CustomBool1Name { get; set; }
        public bool CustomBool2State { get; set; }
        public string? CustomBool2Name { get; set; }
        public bool CustomBool3State { get; set; }
        public string? CustomBool3Name { get; set; }

        // Custom link fields
        public bool CustomLink1State { get; set; }
        public string? CustomLink1Name { get; set; }
        public bool CustomLink2State { get; set; }
        public string? CustomLink2Name { get; set; }
        public bool CustomLink3State { get; set; }
        public string? CustomLink3Name { get; set; }
    }
}
