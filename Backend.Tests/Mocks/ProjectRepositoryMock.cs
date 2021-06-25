using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;

namespace Backend.Tests.Mocks
{
    public class ProjectRepositoryMock : IProjectRepository
    {
        private readonly List<Project> _projects;

        public ProjectRepositoryMock()
        {
            _projects = new List<Project>();
        }

        public Task<List<Project>> GetAllProjects()
        {
            return Task.FromResult(_projects.Select(project => project.Clone()).ToList());
        }

        public Task<Project?> GetProject(string id)
        {
            try
            {
                var foundProjects = _projects.Single(project => project.Id == id);
                return Task.FromResult<Project?>(foundProjects.Clone());
            }
            catch (InvalidOperationException)
            {
                // If a Project is missing, the real service returns null.
                return Task.FromResult<Project?>(null);
            }
        }

        public Task<Project?> Create(Project project)
        {
            // Confirm that project name isn't empty or taken
            if (string.IsNullOrEmpty(project.Name) || GetProjectIdByName(project.Name).Result is not null)
            {
                return Task.FromResult<Project?>(null);
            }

            project.Id = Guid.NewGuid().ToString();
            _projects.Add(project.Clone());
            return Task.FromResult<Project?>(project.Clone());
        }

        public Task<bool> DeleteAllProjects()
        {
            _projects.Clear();
            return Task.FromResult(true);
        }

        /// <summary>
        /// Delete a project and any associated files stored on disk.
        /// </summary>
        public Task<bool> Delete(string id)
        {
            var foundProject = _projects.Single(project => project.Id == id);
            var success = _projects.Remove(foundProject);

            // Clean up any files stored on disk for this project.
            var projectFilePath = FileStorage.GetProjectDir(id);
            if (Directory.Exists(projectFilePath))
            {
                Directory.Delete(projectFilePath, true);
            }
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

        public Task<string?> GetProjectIdByName(string projectName)
        {
            var project = _projects.Find(x =>
                x.Name == projectName);
            return Task.FromResult(project?.Id);
        }

        public Task<bool> CanImportLift(string projectId)
        {
            return Task.FromResult(true);
        }
    }
}
