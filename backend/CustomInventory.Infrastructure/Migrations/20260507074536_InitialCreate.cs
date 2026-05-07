using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CustomInventory.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Inventories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    ImageUrl = table.Column<string>(type: "text", nullable: true),
                    IsPublic = table.Column<bool>(type: "boolean", nullable: false),
                    CreatorId = table.Column<string>(type: "text", nullable: false),
                    CategoryId = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CustomString1State = table.Column<bool>(type: "boolean", nullable: false),
                    CustomString1Name = table.Column<string>(type: "text", nullable: true),
                    CustomString2State = table.Column<bool>(type: "boolean", nullable: false),
                    CustomString2Name = table.Column<string>(type: "text", nullable: true),
                    CustomString3State = table.Column<bool>(type: "boolean", nullable: false),
                    CustomString3Name = table.Column<string>(type: "text", nullable: true),
                    CustomText1State = table.Column<bool>(type: "boolean", nullable: false),
                    CustomText1Name = table.Column<string>(type: "text", nullable: true),
                    CustomText2State = table.Column<bool>(type: "boolean", nullable: false),
                    CustomText2Name = table.Column<string>(type: "text", nullable: true),
                    CustomText3State = table.Column<bool>(type: "boolean", nullable: false),
                    CustomText3Name = table.Column<string>(type: "text", nullable: true),
                    CustomInt1State = table.Column<bool>(type: "boolean", nullable: false),
                    CustomInt1Name = table.Column<string>(type: "text", nullable: true),
                    CustomInt2State = table.Column<bool>(type: "boolean", nullable: false),
                    CustomInt2Name = table.Column<string>(type: "text", nullable: true),
                    CustomInt3State = table.Column<bool>(type: "boolean", nullable: false),
                    CustomInt3Name = table.Column<string>(type: "text", nullable: true),
                    CustomBool1State = table.Column<bool>(type: "boolean", nullable: false),
                    CustomBool1Name = table.Column<string>(type: "text", nullable: true),
                    CustomBool2State = table.Column<bool>(type: "boolean", nullable: false),
                    CustomBool2Name = table.Column<string>(type: "text", nullable: true),
                    CustomBool3State = table.Column<bool>(type: "boolean", nullable: false),
                    CustomBool3Name = table.Column<string>(type: "text", nullable: true),
                    CustomLink1State = table.Column<bool>(type: "boolean", nullable: false),
                    CustomLink1Name = table.Column<string>(type: "text", nullable: true),
                    CustomLink2State = table.Column<bool>(type: "boolean", nullable: false),
                    CustomLink2Name = table.Column<string>(type: "text", nullable: true),
                    CustomLink3State = table.Column<bool>(type: "boolean", nullable: false),
                    CustomLink3Name = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Inventories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Inventories_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Items",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomId = table.Column<string>(type: "text", nullable: false),
                    InventoryId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatorId = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CustomString1Value = table.Column<string>(type: "text", nullable: true),
                    CustomString2Value = table.Column<string>(type: "text", nullable: true),
                    CustomString3Value = table.Column<string>(type: "text", nullable: true),
                    CustomText1Value = table.Column<string>(type: "text", nullable: true),
                    CustomText2Value = table.Column<string>(type: "text", nullable: true),
                    CustomText3Value = table.Column<string>(type: "text", nullable: true),
                    CustomInt1Value = table.Column<double>(type: "double precision", nullable: true),
                    CustomInt2Value = table.Column<double>(type: "double precision", nullable: true),
                    CustomInt3Value = table.Column<double>(type: "double precision", nullable: true),
                    CustomBool1Value = table.Column<bool>(type: "boolean", nullable: true),
                    CustomBool2Value = table.Column<bool>(type: "boolean", nullable: true),
                    CustomBool3Value = table.Column<bool>(type: "boolean", nullable: true),
                    CustomLink1Value = table.Column<string>(type: "text", nullable: true),
                    CustomLink2Value = table.Column<string>(type: "text", nullable: true),
                    CustomLink3Value = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Items", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Items_Inventories_InventoryId",
                        column: x => x.InventoryId,
                        principalTable: "Inventories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Inventories_CategoryId",
                table: "Inventories",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Items_InventoryId_Id",
                table: "Items",
                columns: new[] { "InventoryId", "Id" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Items");

            migrationBuilder.DropTable(
                name: "Inventories");

            migrationBuilder.DropTable(
                name: "Categories");
        }
    }
}
