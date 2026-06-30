using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthCare.Migrations
{
    /// <inheritdoc />
    public partial class AddDriverProfileFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AvatarUrl",
                table: "Ambulances",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BaseLocation",
                table: "Ambulances",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LicenseNumber",
                table: "Ambulances",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "Rating",
                table: "Ambulances",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<bool>(
                name: "Verified",
                table: "Ambulances",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "YearsActive",
                table: "Ambulances",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AvatarUrl",
                table: "Ambulances");

            migrationBuilder.DropColumn(
                name: "BaseLocation",
                table: "Ambulances");

            migrationBuilder.DropColumn(
                name: "LicenseNumber",
                table: "Ambulances");

            migrationBuilder.DropColumn(
                name: "Rating",
                table: "Ambulances");

            migrationBuilder.DropColumn(
                name: "Verified",
                table: "Ambulances");

            migrationBuilder.DropColumn(
                name: "YearsActive",
                table: "Ambulances");
        }
    }
}
