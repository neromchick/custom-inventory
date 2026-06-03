namespace CustomInventory.Application.DTOs
{
    public class UserResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool IsBlocked { get; set; }
        public IList<string> Roles { get; set; } = new List<string>();
    }
}