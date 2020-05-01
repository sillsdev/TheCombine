using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Services
{
    /// <summary> Atomic database functions for <see cref="Project"/>s </summary>
    public class ProjectService : IProjectService
    {
        private readonly IProjectContext _projectDatabase;

        public ProjectService(IProjectContext collectionSettings)
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
        public async Task<Project> GetProject(string projectId)
        {
            var filterDef = new FilterDefinitionBuilder<Project>();
            var filter = filterDef.Eq(x => x.Id, projectId);

            var projectList = await _projectDatabase.Projects.FindAsync(filter);

            return projectList.FirstOrDefault();
        }

        /// <summary> Adds a <see cref="Project"/> </summary>
        /// <returns> The project created </returns>
        public async Task<Project> Create(Project project)
        {
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
            var filter = Builders<Project>.Filter.Eq(x => x.Id, projectId);

            // Note: Nulls out values not in update body
            var updateDef = Builders<Project>.Update
                .Set(x => x.Name, project.Name)
                .Set(x => x.SemanticDomains, project.SemanticDomains)
                .Set(x => x.VernacularWritingSystem, project.VernacularWritingSystem)
                .Set(x => x.AnalysisWritingSystems, project.AnalysisWritingSystems)
                .Set(x => x.ValidCharacters, project.ValidCharacters)
                .Set(x => x.RejectedCharacters, project.RejectedCharacters)
                .Set(x => x.CustomFields, project.CustomFields)
                .Set(x => x.WordFields, project.WordFields)
                .Set(x => x.PartsOfSpeech, project.PartsOfSpeech)
                .Set(x => x.AutocompleteSetting, project.AutocompleteSetting);

            var updateResult = await _projectDatabase.Projects.UpdateOneAsync(filter, updateDef);

            if (!updateResult.IsAcknowledged)
            {
                return ResultOfUpdate.NotFound;
            }
            else if (updateResult.ModifiedCount > 0)
            {
                return ResultOfUpdate.Updated;
            }
            else
            {
                return ResultOfUpdate.NoChange;
            }
        }

        public bool CanImportLift(string projectId)
        {
            var util = new Utilities();
            var currentPath = util.GenerateFilePath(
                Utilities.FileType.Dir, true, "", Path.Combine(projectId, "Import"));
            var zips = new List<string>(Directory.GetFiles(currentPath, "*.zip"));
            return zips.Count == 0;
        }
    }
}
