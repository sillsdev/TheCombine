using BackendFramework.Models;
using System.Threading.Tasks;

namespace BackendFramework.Interfaces
{
    public interface IPasswordResetService
    {
        Task<EmailToken> CreatePasswordReset(string email);
        Task<bool> ValidateToken(string token);
        Task<bool> ResetPassword(string token, string password);
        Task ExpirePasswordReset(string email);
    }
}
