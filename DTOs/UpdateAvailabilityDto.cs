    public class UpdateAvailabilityDto
    {
        public int Id { get; set; }
        public DateTime AvailableFrom { get; set; }
        public DateTime AvailableTo { get; set; }
        public string? Place { get; set; }
        public int MaxPatients { get; set; } = 1;   // NEW
    }
