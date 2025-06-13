using BackendFramework.Models;
using System.Threading.Tasks;

namespace BackendFramework.Interfaces
{
    public interface IPasswordResetContext
    {
        int ExpireTime { get; }
        Task Insert(EmailToken reset);
        Task ClearAll(string email);
        Task<EmailToken?> FindByToken(string token);
    }
}
