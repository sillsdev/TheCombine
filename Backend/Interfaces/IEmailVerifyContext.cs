using BackendFramework.Models;
using System.Threading.Tasks;

namespace BackendFramework.Interfaces
{
    public interface IEmailVerifyContext
    {
        int ExpireTime { get; }
        public Task Insert(EmailToken reset);
        public Task ClearAll(string email);
        public Task<EmailToken?> FindByToken(string token);
    }
}
