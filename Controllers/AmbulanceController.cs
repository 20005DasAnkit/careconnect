using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HEALTHCARE.Data;
using HEALTHCARE.DTOs;

namespace HEALTHCARE.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "AmbulanceDriver")]
public class AmbulanceController : ControllerBase
{
    private readonly AppDbContext _context;

    public AmbulanceController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("requests")]
    public IActionResult GetRequests()
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var ambulance = _context.Ambulances
            .FirstOrDefault(x => x.UserId == userId);

        if (ambulance == null)
            return NotFound();

        var requests = (
            from r in _context.AmbulanceRequests
            join u in _context.Users
                on r.UserId equals u.Id
            where r.AmbulanceId == ambulance.Id
            orderby r.RequestTime descending
            select new
            {
                r.Id,
                PatientName = u.FullName,
                PatientEmail = u.Email,
                r.PickupLocation,
                r.DestinationLocation,
                r.PickupLat,
                r.PickupLng,
                r.DestinationLat,
                r.DestinationLng,
                r.RequestTime,
                r.Status,
                r.Fare,
                r.VehicleType,
                r.DistanceKm
            }
        ).ToList();

        return Ok(requests);
    }

    [HttpPut("request-status")]
    public IActionResult UpdateStatus(UpdateAmbulanceRequestDto dto)
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var ambulance = _context.Ambulances
            .FirstOrDefault(x => x.UserId == userId);

        if (ambulance == null)
            return NotFound("Ambulance not found");

        var request = _context.AmbulanceRequests
            .FirstOrDefault(x => x.Id == dto.RequestId);

        if (request == null)
            return NotFound("Request not found");

        // Make sure a driver can only update their own assigned requests
        if (request.AmbulanceId != ambulance.Id)
            return Forbid();

        request.Status = dto.Status;

        // Driver accepts a ride → go offline
        if (dto.Status == "Accepted")
        {
            ambulance.IsAvailable = false;
        }

        // Ride finished/cancelled/rejected → come back online
        if (dto.Status is "Rejected" or "Cancelled" or "Completed")
        {
            ambulance.IsAvailable = true;
        }

        _context.SaveChanges();

        return Ok("Updated");
    }

    [HttpGet("profile")]
    public IActionResult GetProfile()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var ambulance = _context.Ambulances
            .FirstOrDefault(x => x.UserId == userId);

        if (ambulance == null)
            return NotFound("Ambulance profile not found");

        var user = _context.Users.FirstOrDefault(u => u.Id == userId);
        if (user == null)
            return NotFound("User not found");

        var totalRides = _context.AmbulanceRequests
            .Count(r => r.AmbulanceId == ambulance.Id && r.Status == "Completed");

        return Ok(new DriverProfileDto
        {
            DriverName = ambulance.DriverName,
            Email = user.Email,
            DriverPhone = ambulance.DriverPhone,
            Type = ambulance.Type,
            VehicleNumber = ambulance.VehicleNumber,
            LicenseNumber = ambulance.LicenseNumber,
            BaseLocation = ambulance.BaseLocation,
            IsAvailable = ambulance.IsAvailable,
            Rating = ambulance.Rating,
            TotalRides = totalRides,
            YearsActive = ambulance.YearsActive,
            Verified = ambulance.Verified,
            AvatarUrl = ambulance.AvatarUrl
        });
    }

    [HttpPut("profile")]
    public IActionResult UpdateProfile(UpdateDriverProfileDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.DriverName) ||
            string.IsNullOrWhiteSpace(dto.DriverPhone) ||
            string.IsNullOrWhiteSpace(dto.Type) ||
            string.IsNullOrWhiteSpace(dto.VehicleNumber) ||
            string.IsNullOrWhiteSpace(dto.LicenseNumber) ||
            string.IsNullOrWhiteSpace(dto.BaseLocation))
        {
            return BadRequest("All fields are required");
        }

        if (dto.Type is not ("NonAC" or "AC" or "Big"))
            return BadRequest("Type must be one of: NonAC, AC, Big");

        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var ambulance = _context.Ambulances
            .FirstOrDefault(x => x.UserId == userId);

        if (ambulance == null)
            return NotFound("Ambulance profile not found");

        var user = _context.Users.FirstOrDefault(u => u.Id == userId);
        if (user == null)
            return NotFound("User not found");

        ambulance.DriverName = dto.DriverName.Trim();
        ambulance.DriverPhone = dto.DriverPhone.Trim();
        ambulance.Type = dto.Type.Trim();
        ambulance.VehicleNumber = dto.VehicleNumber.Trim();
        ambulance.LicenseNumber = dto.LicenseNumber.Trim();
        ambulance.BaseLocation = dto.BaseLocation.Trim();
        _context.SaveChanges();

        var totalRides = _context.AmbulanceRequests
            .Count(r => r.AmbulanceId == ambulance.Id && r.Status == "Completed");

        return Ok(new DriverProfileDto
        {
            DriverName = ambulance.DriverName,
            Email = user.Email,
            DriverPhone = ambulance.DriverPhone,
            Type = ambulance.Type,
            VehicleNumber = ambulance.VehicleNumber,
            LicenseNumber = ambulance.LicenseNumber,
            BaseLocation = ambulance.BaseLocation,
            IsAvailable = ambulance.IsAvailable,
            Rating = ambulance.Rating,
            TotalRides = totalRides,
            YearsActive = ambulance.YearsActive,
            Verified = ambulance.Verified,
            AvatarUrl = ambulance.AvatarUrl
        });
    }

    [HttpPut("availability")]
    public IActionResult UpdateAvailability(UpdateDto dto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var ambulance = _context.Ambulances
            .FirstOrDefault(x => x.UserId == userId);

        if (ambulance == null)
            return NotFound("Ambulance profile not found");

        // Don't allow going offline while a ride is actively in progress
        var hasActiveRide = _context.AmbulanceRequests
            .Any(r => r.AmbulanceId == ambulance.Id &&
                      (r.Status == "Accepted" || r.Status == "InProgress"));

        if (!dto.IsAvailable && hasActiveRide)
            return BadRequest("Can't go offline while a ride is in progress");

        ambulance.IsAvailable = dto.IsAvailable;
        _context.SaveChanges();

        return Ok(new { ambulance.IsAvailable });
    }

    [HttpPut("location")]
    public IActionResult UpdateLocation(
    double lat,
    double lng,
    string? baseLocation)
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var ambulance = _context.Ambulances
            .FirstOrDefault(x => x.UserId == userId);

        if (ambulance == null)
            return NotFound("Ambulance profile not found");

        ambulance.Latitude = lat;
        ambulance.Longitude = lng;

        if (!string.IsNullOrWhiteSpace(baseLocation))
        {
            ambulance.BaseLocation = baseLocation.Trim();
        }

        _context.SaveChanges();

        return Ok(new
        {
            ambulance.Latitude,
            ambulance.Longitude,
            ambulance.BaseLocation
        });
    }
}