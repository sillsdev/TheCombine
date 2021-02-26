using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IProjectService
    {
        Task<List<Project>> GetAllProjects();
        Task<Project?> GetProject(string projectId);
        Task<Project?> Create(Project project);
        Task<ResultOfUpdate> Update(string projectId, Project project);
        Task<bool> Delete(string projectId);
        Task<bool> DeleteAllProjects();
        Task<string> CreateLinkWithToken(Project project, string emailAddress);
        Task<bool> EmailLink(string emailAddress, string emailMessage, string link, string domain, Project project);
        Task<bool> RemoveTokenAndCreateUserRole(Project project, User user, EmailInvite emailInvite);
        Task<string?> GetProjectIdByName(string projectName);
        Task<bool> CanImportLift(string projectId);
    }
}
