using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IProjectRepository
    {
        Task<List<Project>> GetAllProjects();
        Task<Project?> GetProject(string projectId);
        Task<Project?> Create(Project project);
        Task<ResultOfUpdate> Update(string projectId, Project project);
        Task<bool> Delete(string projectId);
        Task<bool> DeleteAllProjects();
        Task<string?> GetProjectIdByName(string projectName);
        Task<bool> CanImportLift(string projectId);
    }
}
