using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IInviteService
    {
        string CreateLink(ProjectInvite invite);
        Task<ProjectInvite> CreateProjectInvite(string projectId, Role role, string emailAddress);
        Task<bool> EmailLink(string emailAddress, string emailMessage, string link, string domain, string projectName);
        Task<EmailInviteStatus> ValidateToken(string projectId, string token);
    }
}
