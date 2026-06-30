namespace HEALTHCARE.DTOs;

public class CreateAvailabilityDto
{
    public DateTime AvailableFrom { get; set; }
    public DateTime AvailableTo { get; set; }
    public string Place{get; set;} = string.Empty;
}