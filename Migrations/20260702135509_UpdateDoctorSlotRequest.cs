using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthCare.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDoctorSlotRequest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AvailabilityCreated",
                table: "DoctorSlotRequests",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Reason",
                table: "DoctorSlotRequests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReviewedAt",
                table: "DoctorSlotRequests",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ReviewedBy",
                table: "DoctorSlotRequests",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AvailabilityCreated",
                table: "DoctorSlotRequests");

            migrationBuilder.DropColumn(
                name: "Reason",
                table: "DoctorSlotRequests");

            migrationBuilder.DropColumn(
                name: "ReviewedAt",
                table: "DoctorSlotRequests");

            migrationBuilder.DropColumn(
                name: "ReviewedBy",
                table: "DoctorSlotRequests");
        }
    }
}
