namespace HEALTHCARE.DTOs;

public class MedicineInvoiceDto
{
    public int OrderId { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }

    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerAddress { get; set; } = string.Empty;

    public string DeliveryStatus { get; set; } = string.Empty;
    public DateTime? DeliveryDate { get; set; }

    public string PaymentMethod { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public string? TransactionId { get; set; }

    public decimal SubTotal { get; set; }
    public decimal DeliveryCharge { get; set; }
    public decimal Discount { get; set; }
    public decimal TotalAmount { get; set; }

    public List<MedicineInvoiceItemDto> Items { get; set; } = new();
}