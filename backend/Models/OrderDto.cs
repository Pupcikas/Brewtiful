namespace Brewtiful.Models
{
    public class OrderDto
    {
        public string Id { get; set; }
        public string UserId { get; set; }
        public OrderStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<OrderItem> Items { get; set; }
        public double TotalAmount { get; set; }
    }
}
