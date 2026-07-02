namespace HEALTHCARE.Models;

public class DoctorSlotRequest
{
    public int Id { get; set; }

    public int DoctorId { get; set; }
    public Doctor? Doctor { get; set; }

    public int HospitalId { get; set; }
    public Hospital? Hospital { get; set; }

    public int HospitalSessionId { get; set; }
    public HospitalSession? HospitalSession { get; set; }

    public DateTime RequestedFrom { get; set; }

    public DateTime RequestedTo { get; set; }

    public int MaxPatients { get; set; }

    public string Status { get; set; } = "Pending";
    // Pending
    // Approved
    // Rejected

    public string? AdminRemark { get; set; }

    public DateTime RequestedAt { get; set; } = DateTime.Now;
}