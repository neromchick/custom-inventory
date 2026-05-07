using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CustomInventory.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixTagsColumnType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string[]>(
                name: "Tags",
                table: "Inventories",
                type: "text[]",
                nullable: false,
                defaultValue: new string[0]);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Tags",
                table: "Inventories");
        }
    }
}
