using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Repositories
{
    /// <summary> Atomic database functions for <see cref="Project"/>s </summary>
    [ExcludeFromCodeCoverage]
    public class ProjectRepository : IProjectRepository
    {
        private readonly IProjectContext _projectDatabase;

        public ProjectRepository(IProjectContext collectionSettings)
        {
            _projectDatabase = collectionSettings;
        }

        /// <summary> Finds all <see cref="Project"/>s </summary>
        public async Task<List<Project>> GetAllProjects()
        {
            return await _projectDatabase.Projects.Find(_ => true).ToListAsync();
        }

        /// <summary> Removes all <see cref="Project"/>s </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> DeleteAllProjects()
        {
            var deleted = await _projectDatabase.Projects.DeleteManyAsync(_ => true);
            return deleted.DeletedCount != 0;
        }

        /// <summary> Finds <see cref="Project"/> with specified projectId </summary>
        /// <returns> Project or null if the Project does not exist. </returns>
        public async Task<Project?> GetProject(string projectId)
        {
            var filterDef = new FilterDefinitionBuilder<Project>();
            var filter = filterDef.Eq(x => x.Id, projectId);

            var projectList = await _projectDatabase.Projects.FindAsync(filter);
            try
            {
                return await projectList.FirstAsync();
            }
            catch (InvalidOperationException)
            {
                return null;
            }
        }

        /// <summary> Adds a <see cref="Project"/> </summary>
        /// <returns> The project created </returns>
        public async Task<Project?> Create(Project project)
        {
            // Confirm that project name isn't empty or taken
            if (string.IsNullOrEmpty(project.Name) || await GetProjectIdByName(project.Name) is not null)
            {
                return null;
            }

            await _projectDatabase.Projects.InsertOneAsync(project);
            return project;
        }

        /// <summary> Removes <see cref="Project"/> with specified projectId </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> Delete(string projectId)
        {
            var deleted = await _projectDatabase.Projects.DeleteOneAsync(x => x.Id == projectId);
            return deleted.DeletedCount > 0;
        }

        /// <summary> Updates <see cref="Project"/> with specified projectId </summary>
        /// <returns> A <see cref="ResultOfUpdate"/> enum: success of operation </returns>
        public async Task<ResultOfUpdate> Update(string projectId, Project project)
        {
            // Confirm that project name isn't empty or taken
            if (string.IsNullOrEmpty(project.Name))
            {
                return ResultOfUpdate.Failed;
            }
            var projectIdWithName = await GetProjectIdByName(project.Name);
            if (projectIdWithName is not null && projectIdWithName != project.Id)
            {
                return ResultOfUpdate.Failed;
            }

            var filter = Builders<Project>.Filter.Eq(x => x.Id, projectId);

            // Note: Nulls out values not in update body
            var updateDef = Builders<Project>.Update
                .Set(x => x.Name, project.Name)
                .Set(x => x.IsActive, project.IsActive)
                .Set(x => x.LiftImported, project.LiftImported)
                .Set(x => x.DefinitionsEnabled, project.DefinitionsEnabled)
                .Set(x => x.SemanticDomains, project.SemanticDomains)
                .Set(x => x.VernacularWritingSystem, project.VernacularWritingSystem)
                .Set(x => x.AnalysisWritingSystems, project.AnalysisWritingSystems)
                .Set(x => x.ValidCharacters, project.ValidCharacters)
                .Set(x => x.RejectedCharacters, project.RejectedCharacters)
                .Set(x => x.CustomFields, project.CustomFields)
                .Set(x => x.WordFields, project.WordFields)
                .Set(x => x.PartsOfSpeech, project.PartsOfSpeech)
                .Set(x => x.AutocompleteSetting, project.AutocompleteSetting)
                .Set(x => x.InviteTokens, project.InviteTokens);

            var updateResult = await _projectDatabase.Projects.UpdateOneAsync(filter, updateDef);

            if (!updateResult.IsAcknowledged)
            {
                return ResultOfUpdate.NotFound;
            }

            if (updateResult.ModifiedCount > 0)
            {
                return ResultOfUpdate.Updated;
            }

            return ResultOfUpdate.NoChange;
        }

        public async Task<string?> GetProjectIdByName(string projectName)
        {
            var project = (await GetAllProjects()).Find(x =>
                x.Name == projectName);
            return project?.Id;
        }

        public async Task<bool> CanImportLift(string projectId)
        {
            var project = await GetProject(projectId);
            if (project is null)
            {
                return false;
            }

            return !project.LiftImported;
        }
    }
}
