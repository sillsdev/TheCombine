using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using BackendFramework.ValueModels;
using BackendFramework.Interfaces;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using BackendFramework.Context;
using BackendFramework.Services;
using System.Threading.Tasks;
using MongoDB.Bson;
using System;
using SIL.Lift.Parsing;
using System.Text.RegularExpressions;
using BackendFramework.Controllers;

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

        public async Task<List<Project>> GetProjects(List<string> Ids)
        {
            var filterDef = new FilterDefinitionBuilder<Project>();
            var filter = filterDef.In(x => x.Id, Ids);
            var projectList = await _projectDatabase.Projects.Find(filter).ToListAsync();

            return projectList;
        }

        public async Task<Project> Create(Project project)
        {
            await _projectDatabase.Projects.InsertOneAsync(project);
            return project;
        }

        public async Task<bool> Delete(string Id)
        {
            var deleted = await _projectDatabase.Projects.DeleteManyAsync(x => x.Id == Id);
            return deleted.DeletedCount > 0;
        }

        public async Task<bool> Update(string Id, Project project)
        {
            FilterDefinition<Project> filter = Builders<Project>.Filter.Eq(x => x.Id, Id);

            Project updatedProject = new Project();

            //Note: Nulls out values not in update body
            var updateDef = Builders<Project>.Update
                .Set(x => x.Name, project.Name)
                .Set(x => x.SemanticDomains, project.SemanticDomains)
                .Set(x => x.UserRoles, project.UserRoles)
                //.Set(x => x.Words, project.Words)
                .Set(x => x.VernacularWritingSystem, project.VernacularWritingSystem)
                .Set(x => x.AnalysisWritingSystems, project.AnalysisWritingSystems)
                .Set(x => x.CharacterSet, project.CharacterSet)
                .Set(x => x.CustomFields, project.CustomFields)
                .Set(x => x.WordFields, project.WordFields)
                .Set(x => x.PartsOfSpeech, project.PartsOfSpeech);

            var updateResult = await _projectDatabase.Projects.UpdateOneAsync(filter, updateDef);

            return updateResult.IsAcknowledged && updateResult.ModifiedCount > 0;
        }
    }
}