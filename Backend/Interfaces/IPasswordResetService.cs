using System.Threading.Tasks;

namespace BackendFramework.Interfaces
{
    public interface IPasswordResetService
    {
        Task<bool> ResetPassword(string token, string password);
        Task<bool> ResetPasswordRequest(string emailOrUsername);
        Task<bool> ValidateToken(string token);
    }
}
