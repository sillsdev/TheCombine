using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;

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
            try
            {
                var foundProjects = _projects.Single(project => project.Id == id);
                return Task.FromResult(foundProjects.Clone());
            }
            catch (InvalidOperationException)
            {
                // When a Project is missing, the real ProjectController returns null.
                return null;
            }
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

        public Task<bool> Delete(string id)
        {
            var foundProject = _projects.Single(project => project.Id == id);
            var success = _projects.Remove(foundProject);
            return Task.FromResult(success);
        }

        public Task<ResultOfUpdate> Update(string id, Project project)
        {
            var foundProject = _projects.Single(u => u.Id == id);
            var success = _projects.Remove(foundProject);
            if (success)
            {
                _projects.Add(project.Clone());
                return Task.FromResult(ResultOfUpdate.Updated);
            }
            return Task.FromResult(ResultOfUpdate.NotFound);
        }

        public Task<bool> DuplicateCheck(string projectName)
        {
            foreach (var project in _projects)
            {
                if (project.Name == projectName)
                {
                    return Task.FromResult(true);
                }
            }
            return Task.FromResult(false);
        }

        public bool CanImportLift(string projectId)
        {
            return true;
        }
    }
}
