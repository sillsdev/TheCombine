using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IPasswordResetContext
    {
        public Task Insert(EmailToken reset);
        public Task ClearAll(string email);
        public Task<EmailToken?> FindByToken(string token);
    }
}
