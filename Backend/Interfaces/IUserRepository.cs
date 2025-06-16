using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IUserRepository
    {
        Task<List<User>> GetAllUsers();
        Task<List<User>> GetAllUsersByFilter(string filter);
        Task<User?> GetUser(string userId, bool sanitize = true);
        Task<ResultOfUpdate> ChangePassword(string userId, string password);
        Task<User?> Create(User user);
        Task<User?> GetUserByEmail(string email, bool sanitize = true);
        Task<User?> GetUserByEmailOrUsername(string emailOrUsername, bool sanitize = true);
        Task<User?> GetUserByUsername(string username, bool sanitize = true);
        Task<ResultOfUpdate> Update(string userId, User user, bool updateIsAdmin = false);
        Task<bool> Delete(string userId);
        Task<bool> DeleteAllUsers();
    }
}
