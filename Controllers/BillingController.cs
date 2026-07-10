using System.Security.Claims;
using HEALTHCARE.Data;
using HEALTHCARE.Dtos;
using HEALTHCARE.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HEALTHCARE.Controllers
{
    [ApiController]
    [Route("api/patient")]
    [Authorize(Roles = "Patient")]
    public class BillingController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly BillingPdfService _pdfService;
        public BillingController(AppDbContext context, BillingPdfService pdfService)
        {
            _context = context;
            _pdfService = pdfService;
        }

        [HttpGet("appointments/{id}/bill/pdf")]
        public async Task<IActionResult> DownloadBill(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var appointment = await _context.Appointments
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .Include(a => a.Patient)
                .Include(a => a.DoctorAvailability)
                .FirstOrDefaultAsync(a => a.Id == id && a.PatientId == userId);

            if (appointment == null)
                return NotFound(new { message = "Appointment not found." });

            // Bill is only available once the doctor has confirmed, or the visit is complete.
            if (appointment.Status != "Confirmed" && appointment.Status != "Completed")
                return BadRequest(new { message = "Bill is available once the appointment is confirmed." });

            var totalFee = appointment.Doctor?.Fee ?? (appointment.AdvanceAmount * 2);
            var advance = appointment.AdvanceAmount;
            var creditApplied = appointment.WalletUsed;
            var advancePaid = Math.Max(advance - creditApplied, 0);
            var balanceDue = Math.Max(totalFee - advance, 0);
            var balancePaid = appointment.Status == "Completed";

            var dto = new BillingResponseDto
            {
                AppointmentId = appointment.Id,
                PatientName = appointment.PatientName,
                PatientPhone = appointment.PatientPhone,
                PatientEmail = appointment.PatientEmail,
                PatientDob = appointment.PatientDob,
                PatientAddress = appointment.Address,
                DoctorName = appointment.Doctor?.User?.FullName ?? "N/A",
                DoctorSpecialization = appointment.Doctor?.Specialization ?? "",
                HospitalName = appointment.Doctor?.HospitalName ?? "CareConnect Partner Hospital",
                AppointmentDate = appointment.DoctorAvailability?.AvailableFrom ?? appointment.BookedAt,
                AppointmentTime = (appointment.DoctorAvailability?.AvailableFrom ?? appointment.BookedAt).ToString("hh:mm tt"),
                BookedAt = appointment.BookedAt,
                Status = appointment.Status,
                PlaceToVisit = appointment.DoctorAvailability?.Place ?? "",
                TotalFee = totalFee,
                AdvanceAmount = advance,
                CreditApplied = creditApplied,
                AdvancePayable = advancePaid,
                BalanceDue = balanceDue,
                BalancePaid = balancePaid,
                RefundAmount = appointment.Status.Contains("Cancelled") ? 0 : null,
            };

            var pdfBytes = _pdfService.Generate(dto);
            var fileName = $"CareConnect_Bill_{dto.PatientName.Replace(" ", "_")}_{appointment.Id}.pdf";
            return File(pdfBytes, "application/pdf", fileName);
        }
    }
}