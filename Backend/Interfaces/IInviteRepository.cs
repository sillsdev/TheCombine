using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IInviteRepository
    {
        public Task Insert(ProjectInvite invite);
        public Task ClearAll(string projectId, string email);
        public Task<ProjectInvite?> FindByToken(string token);
    }
}
