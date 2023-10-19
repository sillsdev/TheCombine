using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IUserEditRepository : IRepositoryByProjectId<UserEdit>
    {
        Task<bool> Replace(string projectId, string entryId, UserEdit entry);
    }
}
