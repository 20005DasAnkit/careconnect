namespace HEALTHCARE.Models;

public class Order
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public AppUser? User { get; set; }

    public decimal TotalAmount { get; set; }

    public DateTime OrderDate { get; set; } = DateTime.UtcNow;

    public string Status { get; set; } = "Pending";

    public string DeliveryAddress { get; set; } = string.Empty;

    public string PaymentMode { get; set; } = "COD";

    public string PaymentStatus { get; set; } = "Pending";

    public string? RazorpayPaymentId { get; set; }

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}