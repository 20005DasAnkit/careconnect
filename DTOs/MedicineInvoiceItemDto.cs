namespace HEALTHCARE.DTOs;
public class MedicineInvoiceItemDto
{
    public string MedicineName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice => UnitPrice * Quantity;
}