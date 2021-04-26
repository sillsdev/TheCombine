using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IUserRepository
    {
        Task<List<User>> GetAllUsers();
        Task<User?> GetUser(string userId, bool sanitize = false);
        Task<ResultOfUpdate> ChangePassword(string userId, string password);
        Task<User?> Create(User user);
        Task<User?> GetUserByEmail(string email);
        Task<User?> GetUserByUsername(string username);
        Task<ResultOfUpdate> Update(string userId, User user, bool updateIsAdmin = false);
        Task<bool> Delete(string userId);
        Task<bool> DeleteAllUsers();
    }
}
