using BackendFramework.ValueModels;
using System.Collections.Generic;
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
