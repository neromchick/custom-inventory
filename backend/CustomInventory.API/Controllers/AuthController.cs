using CustomInventory.Application.DTOs;
using CustomInventory.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CustomInventory.API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _service;

        public AuthController(IAuthService service)
        {
            _service = service;
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterAsync(RegisterDto dto)
        {
            var token = await _service.RegisterAsync(dto);
            return token == null ? BadRequest("Registration failed") : Ok(new { token });
        }

        [HttpPost("login")]
        public async Task<IActionResult> LoginAsync(LoginDto dto)
        {
            var token = await _service.LoginAsync(dto);
            return token == null ? Unauthorized("Invalid credentials") : Ok(new { token });
        }
    }
}