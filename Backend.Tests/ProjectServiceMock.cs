using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Backend.Tests
{
    public class ProjectServiceMock : IProjectService
    {

        List<Project> projects;

        public ProjectServiceMock()
        {
            projects = new List<Project>();
        }

        public Task<List<Project>> GetAllProjects()
        {
            return Task.FromResult(projects.Select(project => project.Clone()).ToList());
        }

        bool IDInList(string Id, List<string> Ids)
        {
            foreach (string cur_id in Ids)
            {
                if (cur_id.Equals(Id))
                {
                    return true;
                }
            }
            return false;
        }

        public Task<List<Project>> GetProjects(List<string> ids)
        {
            var foundProjects = projects.Where(project => IDInList(project.Id, ids)).ToList();
            var copiedProjects = foundProjects.Select(project => project.Clone()).ToList();
            return Task.FromResult(copiedProjects);
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
