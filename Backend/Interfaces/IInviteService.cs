using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IInviteService
    {
        Task<string> EmailLink(Project project, Role role, string emailAddress, string message);
        Task<EmailInviteStatus> ValidateToken(string projectId, string token);
    }
}
