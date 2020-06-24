using BackendFramework.Models;
using System.Threading.Tasks;

namespace BackendFramework.Interfaces
{
    public interface IPasswordResetContext
    {
        public Task Insert(PasswordReset reset);
        public Task ClearAll(string email);
        public Task<PasswordReset> FindByToken(string token);
    }
}
