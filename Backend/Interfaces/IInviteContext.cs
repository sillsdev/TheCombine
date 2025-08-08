using System;
using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IInviteContext
    {
        TimeSpan ExpireTime { get; }
        public Task Insert(ProjectInvite invite);
        public Task ClearAll(string projectId, string email);
        public Task<ProjectInvite?> FindByToken(string token);
    }
}
