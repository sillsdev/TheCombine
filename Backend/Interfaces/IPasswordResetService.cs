using BackendFramework.Models;
using System.Threading.Tasks;

namespace BackendFramework.Interfaces
{
    public interface IPasswordResetService
    {
        Task<PasswordReset> CreatePasswordReset(string email);
        Task<bool> ResetPassword(string email, string token, string password);
        Task ExpirePasswordReset(string email);
    }
}
