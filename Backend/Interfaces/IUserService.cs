using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IUserService
    {
        Task<User?> Authenticate(string username, string password);
        Task<User?> MakeJwt(User user);
    }
}
