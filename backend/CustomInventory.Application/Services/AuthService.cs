using CustomInventory.Application.DTOs;
using CustomInventory.Application.Interfaces;
using CustomInventory.Application.Services;
using CustomInventory.Domain.Entities;
using Microsoft.AspNetCore.Identity;

public class AuthService : IAuthService
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IJwtTokenService _jwtTokenService;

    public AuthService(UserManager<AppUser> userManager, IJwtTokenService jwtTokenService)
    {
        _userManager = userManager;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<string?> RegisterAsync(RegisterDto dto)
    {
        var user = new AppUser
        {
            UserName = dto.UserName,
            Email = dto.Email
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded) return null;

        await _userManager.AddToRoleAsync(user, "User"); // CHECKCHECKCHECKCHECKCHECKCHECK

        var roles = await _userManager.GetRolesAsync(user);

        return _jwtTokenService.GenerateToken(user, roles);
    }

    public async Task<string?> LoginAsync(LoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null) return null;

        var isValid = await _userManager.CheckPasswordAsync(user, dto.Password);
        if (!isValid) return null;

        var roles = await _userManager.GetRolesAsync(user);

        return _jwtTokenService.GenerateToken(user, roles);
    }

    public async Task<string> LoginOrRegisterExternalAsync(string email, string name)
    {
        var user = await _userManager.FindByEmailAsync(email);

        if(user == null)
        {
            user = new AppUser
            {
                UserName = name,
                Email = email,
                EmailConfirmed = true
            };

            var createResult = await _userManager.CreateAsync(user);
            if (!createResult.Succeeded)
                throw new Exception("не удалось создать пользователя через внешнюю авторизацию");

            await _userManager.AddToRoleAsync(user, "User");
        }

        var roles = await _userManager.GetRolesAsync(user);

        return _jwtTokenService.GenerateToken(user, roles);
    }
}