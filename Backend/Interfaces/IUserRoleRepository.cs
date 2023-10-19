using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IUserRoleRepository : IRepositoryByProjectId<UserRole>
    {
        Task<ResultOfUpdate> Update(string entryId, UserRole entry);
    }
}
