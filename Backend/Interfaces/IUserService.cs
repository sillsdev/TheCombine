using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IUserService
    {
        Task<List<User>> GetAllUsers();
        Task<User?> GetUser(string userId, bool sanitize = false);
        Task<string?> GetUserAvatar(string userId);
        Task<User?> Create(User user);
        Task<ResultOfUpdate> Update(string userId, User user, bool updateIsAdmin = false);
        Task<bool> Delete(string userId);
        Task<bool> DeleteAllUsers();
        Task<User?> Authenticate(string username, string password);
        Task<User?> MakeJwt(User user);
        Task<ResultOfUpdate> ChangePassword(string userId, string password);
    }
}
