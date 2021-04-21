using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IUserService
    {
        Task<string?> GetUserIdByEmail(string email);
        Task<string?> GetUserIdByUsername(string username);
        Task<User?> Authenticate(string username, string password);
        Task<User?> MakeJwt(User user);
    }
}
