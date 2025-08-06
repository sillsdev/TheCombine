using System;
using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IPasswordResetService
    {
        TimeSpan ExpireTime { get; }
        Task<EmailToken> CreatePasswordReset(string email);
        Task<bool> ValidateToken(string token);
        Task<bool> ResetPassword(string token, string password);
        Task ExpirePasswordReset(string email);
    }
}
