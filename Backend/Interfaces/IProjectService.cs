using BackendFramework.ValueModels;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace BackendFramework.Interfaces
{
    public interface IProjectService
    {
        Task<List<Project>> GetAllProjects();
        Task<List<Project>> GetProjects(List<string> Ids);
        Task<Project> Create(Project project);
        Task<bool> Update(string Id, Project project);
        Task<bool> Delete(string Id);
        Task<bool> DeleteAllProjects();
        Task<bool> Upload();
    }
}
