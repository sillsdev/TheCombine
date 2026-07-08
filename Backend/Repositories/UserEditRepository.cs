using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Otel;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

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

        /// <summary>
        /// Appends an <see cref="Edit"/> to the <see cref="UserEdit"/> with specified userEditId and projectId,
        /// dropping the oldest edits if the total exceeds <see cref="UserEdit.MaxEdits"/>.
        /// </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> AddEdit(string projectId, string userEditId, Edit edit)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "adding an edit to a user edit");

            var filterDef = new FilterDefinitionBuilder<UserEdit>();
            var filter = filterDef.And(filterDef.Eq(
                x => x.ProjectId, projectId), filterDef.Eq(x => x.Id, userEditId));

            // The negative slice atomically keeps only the most recent MaxEdits entries,
            // preventing the document from growing towards MongoDB's 16 MB limit.
            var update = Builders<UserEdit>.Update.PushEach(u => u.Edits, [edit], slice: -UserEdit.MaxEdits);
            var result = await _userEdits.UpdateOneAsync(filter, update);
            return result.IsAcknowledged && result.MatchedCount == 1;
        }

        /// <summary>
        /// Replaces the <see cref="Edit"/> with matching guid in the <see cref="UserEdit"/>
        /// with specified userEditId and projectId.
        /// </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> ReplaceEdit(string projectId, string userEditId, Edit edit)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "replacing an edit in a user edit");

            var filterDef = new FilterDefinitionBuilder<UserEdit>();
            var filter = filterDef.And(
                filterDef.Eq(x => x.ProjectId, projectId),
                filterDef.Eq(x => x.Id, userEditId),
                filterDef.ElemMatch(x => x.Edits, e => e.Guid == edit.Guid));

            var update = Builders<UserEdit>.Update.Set(u => u.Edits.FirstMatchingElement(), edit);
            var result = await _userEdits.UpdateOneAsync(filter, update);
            // MatchedCount, not ModifiedCount: replacing an edit with an identical one is still a success.
            return result.IsAcknowledged && result.MatchedCount == 1;
        }

        /// <summary>
        /// Appends a step to the <see cref="Edit"/> with matching guid in the <see cref="UserEdit"/>
        /// with specified userEditId and projectId.
        /// </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> AddStepToEdit(string projectId, string userEditId, Guid editGuid, string stepData)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "adding a step to an edit");

            var filterDef = new FilterDefinitionBuilder<UserEdit>();
            var filter = filterDef.And(
                filterDef.Eq(x => x.ProjectId, projectId),
                filterDef.Eq(x => x.Id, userEditId),
                filterDef.ElemMatch(x => x.Edits, e => e.Guid == editGuid));

            var update = Builders<UserEdit>.Update
                .Push(u => u.Edits.FirstMatchingElement().StepData, stepData)
                .Set(u => u.Edits.FirstMatchingElement().Modified, DateTime.UtcNow);
            var result = await _userEdits.UpdateOneAsync(filter, update);
            return result.IsAcknowledged && result.MatchedCount == 1;
        }

        /// <summary>
        /// Overwrites the step at the given index of the <see cref="Edit"/> with matching guid
        /// in the <see cref="UserEdit"/> with specified userEditId and projectId.
        /// </summary>
        /// <remarks> The caller is responsible for ensuring that stepIndex is within bounds. </remarks>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> UpdateStepInEdit(
            string projectId, string userEditId, Guid editGuid, int stepIndex, string stepData)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "updating a step in an edit");

            var filterDef = new FilterDefinitionBuilder<UserEdit>();
            var filter = filterDef.And(
                filterDef.Eq(x => x.ProjectId, projectId),
                filterDef.Eq(x => x.Id, userEditId),
                filterDef.ElemMatch(x => x.Edits, e => e.Guid == editGuid));

            var update = Builders<UserEdit>.Update
                .Set($"edits.$.stepData.{stepIndex}", stepData)
                .Set(u => u.Edits.FirstMatchingElement().Modified, DateTime.UtcNow);
            var result = await _userEdits.UpdateOneAsync(filter, update);
            return result.IsAcknowledged && result.MatchedCount == 1;
        }
    }
}
