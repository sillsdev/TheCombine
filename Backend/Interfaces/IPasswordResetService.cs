using BackendFramework.Models;
using System.Threading.Tasks;

namespace BackendFramework.Interfaces {
    public interface IPasswordResetService {
        Task<PasswordReset> CreatePasswordReset(string email);
        Task ResetPassword(string email, string token, string password);
        Task<bool> ExpirePasswordReset(string email);
    }
}
