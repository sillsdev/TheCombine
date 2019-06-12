using BackendFramework.ValueModels;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace BackendFramework.Interfaces
{
    public interface IUserRoleService
    {
        Task<List<UserRole>> GetAllUserRoles();
        Task<List<UserRole>> GetUserRoles(List<string> Ids);
        Task<UserRole> Create(UserRole userRole);
        Task<bool> Update(string Id, UserRole userRole);
        Task<bool> Delete(string Id);
        Task<bool> DeleteAllUserRoles();
    }
}
