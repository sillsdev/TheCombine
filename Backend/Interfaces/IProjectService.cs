using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IProjectService
    {
        Task<string> CreateLinkWithToken(Project project, string emailAddress);
        Task<bool> EmailLink(string emailAddress, string emailMessage, string link, string domain, Project project);
        Task<bool> RemoveTokenAndCreateUserRole(Project project, User user, EmailInvite emailInvite);
        Task<bool> CanImportLift(string projectId);
    }
}
