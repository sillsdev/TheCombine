using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IProjectService
    {
        Task<List<Project>> GetAllProjects();
        Task<Project> GetProject(string projectId);
        Task<Project> Create(Project project);
        Task<ResultOfUpdate> Update(string projectId, Project project);
        Task<bool> Delete(string projectId);
        Task<bool> DeleteAllProjects();
        Task<string> CreateLinkWithToken(Project project, string emailAddress);
        Task<bool> RemoveTokenAndCreateUserRole(Project project, User user, string token);
        bool CanImportLift(string projectId);
    }
}
