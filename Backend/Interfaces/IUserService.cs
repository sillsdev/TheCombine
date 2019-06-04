using BackendFramework.ValueModels;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BackendFramework.Interfaces
{
    public interface IUserService
    {
        Task<List<User>> GetAllUsers();
        Task<List<User>> GetUser(string Id);
        Task<User> Create(User user);
        Task<bool> Update(string Id, User user);
        Task<bool> Delete(string Id);
        Task<bool> DeleteAllUsers();
    }
}
