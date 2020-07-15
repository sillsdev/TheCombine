using System;
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
        private readonly IUserService _userService;
        private readonly IUserRoleService _userRoleService;

        public ProjectService(IProjectContext collectionSettings, IUserService userService, IUserRoleService userRoleService)
        {
            _projectDatabase = collectionSettings;
            _userService = userService;
            _userRoleService = userRoleService;
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
                .Set(x => x.AutocompleteSetting, project.AutocompleteSetting)
                .Set(x => x.InviteTokens, project.InviteTokens);

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

        public async Task<string> CreateLinkWithToken(Project project, string emailAddress)
        {

            var token = project.CreateToken();
            project.InviteTokens.Add(token);
            await Update(project.Id, project);

            string linkWithIdentifier = "v1/projects/" + project.Id + "/" + token;
            return linkWithIdentifier;
        }
        public async Task<bool> RemoveTokenAndCreateUserRole(Project project, User user, string token)
        {
            try
            {
                var userRole = new UserRole
                {
                    Permissions = new List<int>
                {
                    (int) Permission.MergeAndCharSet,
                    (int) Permission.Unused,
                    (int) Permission.WordEntry
                },
                    ProjectId = project.Id
                };
                userRole = await _userRoleService.Create(userRole);

                // Update user with userRole
                if (user.ProjectRoles.Equals(null))
                {
                    user.ProjectRoles = new Dictionary<string, string>();
                }

                // Generate the userRoles and update the user
                user.ProjectRoles.Add(project.Id, userRole.Id);
                await _userService.Update(user.Id, user);
                // Generate the JWT based on those new userRoles
                user = await _userService.MakeJwt(user);
                await _userService.Update(user.Id, user);

                // Removes token and update user
                project.InviteTokens.Remove(token);
                await Update(project.Id, project);

                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public bool CanImportLift(string projectId)
        {
            var currentPath = FileUtilities.GenerateFilePath(
                FileUtilities.FileType.Dir, true, "", Path.Combine(projectId, "Import"));
            var zips = new List<string>(Directory.GetFiles(currentPath, "*.zip"));
            return zips.Count == 0;
        }
    }
}
