using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IUserRoleService
    {
        Task<List<UserRole>> GetAllUserRoles(string projectId);
        Task<UserRole?> GetUserRole(string projectId, string userRoleId);
        Task<UserRole> Create(UserRole userRole);
        Task<bool> Delete(string projectId, string userRoleId);
        Task<bool> DeleteAllUserRoles(string projectId);
        Task<ResultOfUpdate> Update(string userRoleId, UserRole userRole);
    }
}
