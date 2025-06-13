using BackendFramework.Models;
using System.Threading.Tasks;

namespace BackendFramework.Interfaces
{
    public interface IPasswordResetService
    {
        Task<EmailToken> CreateEmailToken(string email);
        Task ExpireTokens(string email);
        Task<bool> ValidateToken(string token);
        Task<bool> ResetPassword(string token, string password);
    }
}
