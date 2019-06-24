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
        readonly List<Project> projects;

        public ProjectServiceMock()
        {
            projects = new List<Project>();
        }

        public Task<List<Project>> GetAllProjects()
        {
            return Task.FromResult(projects.Select(project => project.Clone()).ToList());
        }

        public Task<Project> GetProject(string id)
        {
            var foundProjects = projects.Where(project => project.Id == id).Single();
            return Task.FromResult(foundProjects.Clone());
        }

        public Task<Project> Create(Project project)
        {
            project.Id = Guid.NewGuid().ToString();
            projects.Add(project.Clone());
            return Task.FromResult(project.Clone());
        }

        public Task<bool> DeleteAllProjects()
        {
            projects.Clear();
            return Task.FromResult(true);
        }

        public Task<bool> Delete(string Id)
        {
            var foundProject = projects.Single(project => project.Id == Id);
            var success = projects.Remove(foundProject);
            return Task.FromResult(success);
        }

        public Task<bool> Update(string Id, Project project)
        {
            var foundProject = projects.Single(u => u.Id == Id);
            var success = projects.Remove(foundProject);
            if (success)
            {
                projects.Add(project.Clone());
            }
            return Task.FromResult(success);
        }
    }
}
