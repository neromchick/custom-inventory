using CustomInventory.Application.DTOs;
using CustomInventory.Application.Interfaces;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using AspNet.Security.OAuth.GitHub;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CustomInventory.API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _service;
        private readonly IConfiguration _configuration;

        public AuthController(IAuthService service, IConfiguration configuration)
        {
            _service = service;
            _configuration = configuration;
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

        [HttpGet("signin-google")]
        public IActionResult SignInGoogle()
        {
            var properties = new AuthenticationProperties { RedirectUri = Url.Action(nameof(ExternalCallback)) };
            return Challenge(properties, GoogleDefaults.AuthenticationScheme);
        }

        [HttpGet("signin-github")]
        public IActionResult SignInGitHub()
        {
            var properties = new AuthenticationProperties { RedirectUri = Url.Action(nameof(ExternalCallback)) };
            return Challenge(properties, GitHubAuthenticationDefaults.AuthenticationScheme);
        }

        [HttpGet("callback")]
        public async Task<IActionResult> ExternalCallback()
        {
            var authenticateResult = await HttpContext.AuthenticateAsync(IdentityConstants.ExternalScheme);

            if (!authenticateResult.Succeeded)
                return BadRequest("Ошибка авторизации через внешнего провайдера.");

            var email = authenticateResult.Principal.FindFirstValue(ClaimTypes.Email);
            var name = authenticateResult.Principal.FindFirstValue(ClaimTypes.Name) ?? email;

            if (string.IsNullOrEmpty(email))
                return BadRequest("Не удалось получить Email от провайдера.");

            var token = await _service.LoginOrRegisterExternalAsync(email, name!);

            var frontendBaseUrl = _configuration["Authentication:FrontendUrl"] ?? "http://localhost:5173";
            var frontendUrl = $"{frontendBaseUrl.TrimEnd('/')}/oauth-callback?token={token}";

            return Redirect(frontendUrl);
        }
    }
}