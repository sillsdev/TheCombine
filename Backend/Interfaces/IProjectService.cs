using BackendFramework.ValueModels;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BackendFramework.Interfaces
{
    public interface IProjectService
    {
        Task<List<Project>> GetAllProjects();
        Task<Project> GetProject(string Id);
        Task<Project> Create(Project project);
        Task<bool> Update(string Id, Project project);
        Task<bool> Delete(string Id);
        Task<bool> DeleteAllProjects();
    }
}
