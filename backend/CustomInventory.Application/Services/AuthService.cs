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

        return _jwtTokenService.GenerateToken(user);
    }

    public async Task<string?> LoginAsync(LoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null) return null;

        var isValid = await _userManager.CheckPasswordAsync(user, dto.Password);
        if (!isValid) return null;

        return _jwtTokenService.GenerateToken(user);
    }
}