using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BackendFramework.Services
{
    public class ProjectService : IProjectService
    {
        private readonly IProjectContext _projectDatabase;

        public ProjectService(IProjectContext collectionSettings)
        {
            _projectDatabase = collectionSettings;
        }

        public async Task<List<Project>> GetAllProjects()
        {
            return await _projectDatabase.Projects.Find(_ => true).ToListAsync();
        }

        public async Task<bool> DeleteAllProjects()
        {
            var deleted = await _projectDatabase.Projects.DeleteManyAsync(_ => true);

            if (deleted.DeletedCount != 0)
            {
                return true;
            }

            return false;
        }

        public async Task<Project> GetProject(string projectId)
        {
            var filterDef = new FilterDefinitionBuilder<Project>();
            var filter = filterDef.Eq(x => x.Id, projectId);

            var projectList = await _projectDatabase.Projects.FindAsync(filter);

            return projectList.FirstOrDefault();
        }

        public async Task<Project> Create(Project project)
        {
            await _projectDatabase.Projects.InsertOneAsync(project);
            return project;
        }

        public async Task<bool> Delete(string projectId)
        {
            var deleted = await _projectDatabase.Projects.DeleteManyAsync(x => x.Id == projectId);
            return deleted.DeletedCount > 0;
        }

        public async Task<bool> Update(string projectId, Project project)
        {
            FilterDefinition<Project> filter = Builders<Project>.Filter.Eq(x => x.Id, projectId);

            Project updatedProject = new Project();

            //Note: Nulls out values not in update body
            var updateDef = Builders<Project>.Update
                .Set(x => x.Name, project.Name)
                .Set(x => x.SemanticDomains, project.SemanticDomains)
                .Set(x => x.Words, project.Words)
                .Set(x => x.VernacularWritingSystem, project.VernacularWritingSystem)
                .Set(x => x.AnalysisWritingSystems, project.AnalysisWritingSystems)
                .Set(x => x.CharacterSet, project.CharacterSet)
                .Set(x => x.CustomFields, project.CustomFields)
                .Set(x => x.WordFields, project.WordFields)
                .Set(x => x.PartsOfSpeech, project.PartsOfSpeech);

            var updateResult = await _projectDatabase.Projects.UpdateOneAsync(filter, updateDef);

            if (!updateResult.IsAcknowledged)
            {
                throw new Exception("Project not found");
            }

            return updateResult.ModifiedCount > 0;
        }
    }
}