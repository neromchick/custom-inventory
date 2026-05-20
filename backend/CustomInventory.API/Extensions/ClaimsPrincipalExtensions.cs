using System.Security.Claims;

namespace CustomInventory.API.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        public static string GetUserId(this ClaimsPrincipal user)
        {
            return user.FindFirst(ClaimTypes.NameIdentifier)?.Value
                   ?? throw new InvalidOperationException("User ID not found in JWT token.");
        }
    }
}