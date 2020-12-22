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

        public Task<string> CreateLinkWithToken(Project project, string emailAddress)
        {
            return Task.FromResult("");
        }

        public Task<bool> EmailLink(string emailAddress, string emailMessage, string link, string domain, Project project)
        {
            return Task.FromResult(true);
        }

        public Task<bool> RemoveTokenAndCreateUserRole(Project project, User user, EmailInvite token)
        {
            return Task.FromResult(true);
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

        public Task<bool> CanImportLift(string projectId)
        {
            return Task.FromResult(true);
        }
    }
}
