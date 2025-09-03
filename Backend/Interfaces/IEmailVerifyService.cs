using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IEmailVerifyService
    {
        Task<bool> RequestEmailVerify(User user);
        Task<bool> ValidateToken(string token);
    }
}
