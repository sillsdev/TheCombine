using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Otel;
using MongoDB.Driver;

namespace BackendFramework.Repositories
{
    /// <summary> Atomic database functions for <see cref="UserEdit"/>s. </summary>
    [ExcludeFromCodeCoverage]
    public class UserEditRepository(IMongoDbContext dbContext) : IUserEditRepository
    {
        private readonly IMongoCollection<UserEdit> _userEdits =
            dbContext.Db.GetCollection<UserEdit>("UserEditsCollection");

        private const string otelTagName = "otel.UserEditRepository";

        /// <summary> Finds all <see cref="UserEdit"/>s with specified projectId </summary>
        public async Task<List<UserEdit>> GetAllUserEdits(string projectId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting all user edits");

            return await _userEdits.Find(u => u.ProjectId == projectId).ToListAsync();
        }

        /// <summary> Removes all <see cref="UserEdit"/>s for specified <see cref="Project"/> </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> DeleteAllUserEdits(string projectId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "deleting all user edits");

            var deleted = await _userEdits.DeleteManyAsync(u => u.ProjectId == projectId);
            return deleted.DeletedCount != 0;
        }

        /// <summary> Finds <see cref="UserEdit"/> with specified userRoleId and projectId </summary>
        public async Task<UserEdit?> GetUserEdit(string projectId, string userEditId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting a user edit");

            var filterDef = new FilterDefinitionBuilder<UserEdit>();
            var filter = filterDef.And(filterDef.Eq(
                x => x.ProjectId, projectId), filterDef.Eq(x => x.Id, userEditId));

            var userEditList = await _userEdits.FindAsync(filter);

            try
            {
                return await userEditList.FirstAsync();
            }
            catch (InvalidOperationException)
            {
                return null;
            }
        }

        /// <summary> Adds a <see cref="UserEdit"/> </summary>
        /// <returns> The UserEdit created </returns>
        public async Task<UserEdit> Create(UserEdit userEdit)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "creating a user edit");

            await _userEdits.InsertOneAsync(userEdit);
            return userEdit;
        }

        /// <summary> Removes <see cref="UserEdit"/> with specified userRoleId and projectId </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> Delete(string projectId, string userEditId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "deleting a user edit");

            var filterDef = new FilterDefinitionBuilder<UserEdit>();
            var filter = filterDef.And(filterDef.Eq(
                x => x.ProjectId, projectId), filterDef.Eq(x => x.Id, userEditId));

            var deleted = await _userEdits.DeleteOneAsync(filter);
            return deleted.DeletedCount > 0;
        }

        /// <summary> Replaces <see cref="UserEdit"/> with specified userRoleId and projectId </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> Replace(string projectId, string userEditId, UserEdit userEdit)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "replacing a user edit");

            var filterDef = new FilterDefinitionBuilder<UserEdit>();
            var filter = filterDef.And(filterDef.Eq(
                x => x.ProjectId, projectId), filterDef.Eq(x => x.Id, userEditId));

            var result = await _userEdits.ReplaceOneAsync(filter, userEdit);
            return result.ModifiedCount == 1;
        }
    }
}
