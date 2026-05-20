using CustomInventory.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace CustomInventory.Application.Interfaces
{
    public interface IJwtTokenService
    {
        string GenerateToken(AppUser user, IList<string> roles);
    }   
}
