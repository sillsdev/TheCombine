using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IEmailVerifyRepository
    {
        public Task ClearAll(string email);
        public Task<EmailToken?> FindByToken(string token);
        public Task Insert(EmailToken reset);
    }
}
