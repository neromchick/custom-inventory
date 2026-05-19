using CustomInventory.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace CustomInventory.Application.Interfaces
{
    public interface IAuthService
    {
        Task<string?> RegisterAsync(RegisterDto dto);
        Task<string?> LoginAsync(LoginDto dto);
    }
}
