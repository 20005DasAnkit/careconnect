namespace HEALTHCARE.DTOs
{
    public class CreateAvailabilityDto
    {
        public DateTime AvailableFrom { get; set; }
        public DateTime AvailableTo { get; set; }
        public string? Place { get; set; }
        public int MaxPatients { get; set; } = 1;   // NEW — e.g. 20 patients for the day/session
    }
}
