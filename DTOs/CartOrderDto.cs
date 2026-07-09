namespace HEALTHCARE.DTOs
{
    public class CartOrderDto
    {
        public string DeliveryAddress { get; set; } = "";
        public string PaymentMode { get; set; } = "COD";
        public string? RazorpayPaymentId { get; set; }
        public List<CartItemDto> Items { get; set; } = new();
    }
 
    public class CartItemDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }
}
