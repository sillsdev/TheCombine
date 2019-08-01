using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Tests
{
    public class ProjectServiceMock : IProjectService
    {
        private readonly List<Project> _projects;

        public ProjectServiceMock()
        {
            _projects = new List<Project>();
        }

        public Task<List<Project>> GetAllProjects()
        {
            return Task.FromResult(_projects.Select(project => project.Clone()).ToList());
        }

        public Task<Project> GetProject(string id)
        {
            var foundProjects = _projects.Where(project => project.Id == id).Single();
            return Task.FromResult(foundProjects.Clone());
        }

        public Task<Project> Create(Project project)
        {
            project.Id = Guid.NewGuid().ToString();
            _projects.Add(project.Clone());
            return Task.FromResult(project.Clone());
        }

        public Task<bool> DeleteAllProjects()
        {
            _projects.Clear();
            return Task.FromResult(true);
        }

        public Task<bool> Delete(string Id)
        {
            var foundProject = _projects.Single(project => project.Id == Id);
            var success = _projects.Remove(foundProject);
            return Task.FromResult(success);
        }

        public Task<ResultOfUpdate> Update(string Id, Project project)
        {
            var foundProject = _projects.Single(u => u.Id == Id);
            var success = _projects.Remove(foundProject);
            if (success)
            {
                _projects.Add(project.Clone());
                return Task.FromResult(ResultOfUpdate.Updated);
            }
            return Task.FromResult(ResultOfUpdate.NotFound);
        }

        public bool CheckProj(string projectId)
        {
            return true;
        }
    }
}
