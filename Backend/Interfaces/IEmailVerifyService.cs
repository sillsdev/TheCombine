using BackendFramework.Models;
using System.Threading.Tasks;

namespace BackendFramework.Interfaces
{
    public interface IEmailVerifyService
    {
        Task<EmailToken> CreateEmailToken(string email);
        Task ExpireTokens(string email);
        Task<bool> VerifyEmail(string token);
    }
}
