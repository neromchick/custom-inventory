using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CustomInventory.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddItems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CustomId",
                table: "Items");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CustomId",
                table: "Items",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
