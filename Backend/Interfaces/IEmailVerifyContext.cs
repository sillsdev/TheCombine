using BackendFramework.Models;
using System.Threading.Tasks;

namespace BackendFramework.Interfaces
{
    public interface IEmailVerifyContext
    {
        int ExpireTime { get; }
        Task Insert(EmailToken reset);
        Task ClearAll(string email);
        Task<EmailToken?> FindByToken(string token);
    }
}
