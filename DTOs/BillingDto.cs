namespace HEALTHCARE.Dtos
{
    public class BillingResponseDto
    {
        public int AppointmentId { get; set; }
        public string PatientName { get; set; } = "";
        public string DoctorName { get; set; } = "";
        public string DoctorSpecialization { get; set; } = "";
        public string HospitalName { get; set; } = "";
        public DateTime AppointmentDate { get; set; }
        public string AppointmentTime { get; set; } = "";
        public DateTime BookedAt { get; set; }
        public string Status { get; set; } = "";

        public decimal TotalFee { get; set; }
        public decimal AdvanceAmount { get; set; }       // 50% due at booking
        public decimal CreditApplied { get; set; }        // wallet credit used, shown as deduction
        public decimal AdvancePayable { get; set; }        // AdvanceAmount - CreditApplied
        public decimal BalanceDue { get; set; }             // remaining 50%, due at checkup
        public bool BalancePaid { get; set; }

        // Only populated when the appointment was cancelled
        public decimal? RefundAmount { get; set; }
    }
}