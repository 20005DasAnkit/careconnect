namespace HEALTHCARE.Models;
public class DoctorAvailability
{
    public int Id { get; set; }
    public int DoctorId { get; set; }
    public DateTime AvailableFrom { get; set; }
    public DateTime AvailableTo { get; set; }
    public string? Place { get; set; }

    public int MaxPatients { get; set; } = 1;   // NEW — doctor sets this, e.g. 20
    public int BookedCount { get; set; } = 0;    // NEW — increments per booking
    public bool IsBooked { get; set; } = false;  // now means "fully booked", not "booked by one"

    public Doctor? Doctor { get; set; }
}