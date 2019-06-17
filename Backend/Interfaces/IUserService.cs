using BackendFramework.ValueModels;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace BackendFramework.Interfaces
{
    public interface IUserService
    {
        Task<List<User>> GetAllUsers();
        Task<List<User>> GetUsers(List<string> Ids);
        Task<User> Create(User user);
        Task<bool> Update(string Id, User user);
        Task<bool> Delete(string Id);
        Task<bool> DeleteAllUsers();
        Task<User> Authenticate(string username, string password);
    }
}
