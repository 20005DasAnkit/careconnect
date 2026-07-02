using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthCare.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDoctorAvailability : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "HospitalId",
                table: "DoctorAvailabilities",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "HospitalSessionId",
                table: "DoctorAvailabilities",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsApproved",
                table: "DoctorAvailabilities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "DoctorAvailabilities",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "DoctorSlotRequests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DoctorId = table.Column<int>(type: "int", nullable: false),
                    HospitalId = table.Column<int>(type: "int", nullable: false),
                    HospitalSessionId = table.Column<int>(type: "int", nullable: false),
                    RequestedFrom = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RequestedTo = table.Column<DateTime>(type: "datetime2", nullable: false),
                    MaxPatients = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AdminRemark = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RequestedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DoctorSlotRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DoctorSlotRequests_Doctors_DoctorId",
                        column: x => x.DoctorId,
                        principalTable: "Doctors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DoctorSlotRequests_HospitalSessions_HospitalSessionId",
                        column: x => x.HospitalSessionId,
                        principalTable: "HospitalSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DoctorSlotRequests_Hospitals_HospitalId",
                        column: x => x.HospitalId,
                        principalTable: "Hospitals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DoctorAvailabilities_HospitalId",
                table: "DoctorAvailabilities",
                column: "HospitalId");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorAvailabilities_HospitalSessionId",
                table: "DoctorAvailabilities",
                column: "HospitalSessionId");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorSlotRequests_DoctorId",
                table: "DoctorSlotRequests",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorSlotRequests_HospitalId",
                table: "DoctorSlotRequests",
                column: "HospitalId");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorSlotRequests_HospitalSessionId",
                table: "DoctorSlotRequests",
                column: "HospitalSessionId");

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorAvailabilities_HospitalSessions_HospitalSessionId",
                table: "DoctorAvailabilities",
                column: "HospitalSessionId",
                principalTable: "HospitalSessions",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorAvailabilities_Hospitals_HospitalId",
                table: "DoctorAvailabilities",
                column: "HospitalId",
                principalTable: "Hospitals",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DoctorAvailabilities_HospitalSessions_HospitalSessionId",
                table: "DoctorAvailabilities");

            migrationBuilder.DropForeignKey(
                name: "FK_DoctorAvailabilities_Hospitals_HospitalId",
                table: "DoctorAvailabilities");

            migrationBuilder.DropTable(
                name: "DoctorSlotRequests");

            migrationBuilder.DropIndex(
                name: "IX_DoctorAvailabilities_HospitalId",
                table: "DoctorAvailabilities");

            migrationBuilder.DropIndex(
                name: "IX_DoctorAvailabilities_HospitalSessionId",
                table: "DoctorAvailabilities");

            migrationBuilder.DropColumn(
                name: "HospitalId",
                table: "DoctorAvailabilities");

            migrationBuilder.DropColumn(
                name: "HospitalSessionId",
                table: "DoctorAvailabilities");

            migrationBuilder.DropColumn(
                name: "IsApproved",
                table: "DoctorAvailabilities");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "DoctorAvailabilities");
        }
    }
}
