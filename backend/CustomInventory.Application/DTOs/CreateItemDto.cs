using CustomInventory.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace CustomInventory.Application.DTOs
{
    public class CreateItemDto
    {
        // Custom string values
        public string? CustomString1Value { get; set; }
        public string? CustomString2Value { get; set; }
        public string? CustomString3Value { get; set; }

        // Custom text (multiline) values
        public string? CustomText1Value { get; set; }
        public string? CustomText2Value { get; set; }
        public string? CustomText3Value { get; set; }

        // Custom number values
        public double? CustomInt1Value { get; set; }
        public double? CustomInt2Value { get; set; }
        public double? CustomInt3Value { get; set; }

        // Custom bool values
        public bool? CustomBool1Value { get; set; }
        public bool? CustomBool2Value { get; set; }
        public bool? CustomBool3Value { get; set; }

        // Custom link values
        public string? CustomLink1Value { get; set; }
        public string? CustomLink2Value { get; set; }
        public string? CustomLink3Value { get; set; }
    }
}
