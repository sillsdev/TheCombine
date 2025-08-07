using System;
using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IInviteService
    {
        TimeSpan ExpireTime { get; }
        Task<string> CreateLinkWithToken(string projectId, Role role, string emailAddress);
        Task<bool> EmailLink(string emailAddress, string emailMessage, string link, string domain, string projectName);
        Task<ProjectInvite?> FindByToken(string token);
        Task<bool> RemoveTokenAndCreateUserRole(string projectId, User user, ProjectInvite invite);
    }
}
