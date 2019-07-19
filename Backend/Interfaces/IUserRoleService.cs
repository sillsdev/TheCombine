using BackendFramework.ValueModels;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BackendFramework.Interfaces
{
    public interface IUserRoleService
    {
        Task<List<UserRole>> GetAllUserRoles(string projectId);
        Task<UserRole> GetUserRole(string projectId, string userRoleId);
        Task<UserRole> Create(UserRole userRole);
        Task<bool> Delete(string projectId, string uesrRoleId);
        Task<bool> DeleteAllUserRoles(string projectId);
        Task<bool> Update(string userRoleId, UserRole userRole);
    }
}
