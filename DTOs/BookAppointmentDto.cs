namespace HEALTHCARE.DTOs;

public class BookAppointmentDto
{
    public int DoctorAvailabilityId { get; set; }
    public string? PaymentMethod { get; set; }
    public string? RazorpayPaymentId { get; set; }
    public bool UseRefundBalance { get; set; }
}