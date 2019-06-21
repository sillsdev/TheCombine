using BackendFramework.ValueModels;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BackendFramework.Interfaces
{
    public interface IUserService
    {
        Task<List<User>> GetAllUsers();
        Task<User> GetUser(string Id);
        Task<User> Create(User user);
        Task<bool> Update(string Id, User user);
        Task<bool> Delete(string Id);
        Task<bool> DeleteAllUsers();
        Task<User> Authenticate(string username, string password);
    }
}
