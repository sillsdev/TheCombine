using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Otel;
using MongoDB.Bson;
using MongoDB.Driver;

namespace BackendFramework.Repositories
{
    /// <summary> Atomic database functions for <see cref="UserEdit"/>s. </summary>
    [ExcludeFromCodeCoverage]
    public class UserEditRepository(IMongoDbContext dbContext) : IUserEditRepository
    {
        private readonly IMongoDbContext _dbContext = dbContext;
        private readonly IMongoCollection<StoredEdit> _edits =
            dbContext.Db.GetCollection<StoredEdit>("EditsCollection");
        private readonly IMongoCollection<StoredUserEdit> _userEdits =
            dbContext.Db.GetCollection<StoredUserEdit>("UserEditsCollection");

        private const string otelTagName = "otel.UserEditRepository";

        #region Private helper methods

        /// <summary> Creates a mongo filter for the <see cref="StoredUserEdit"/> in a specified project. </summary>
        private static FilterDefinition<StoredUserEdit> GetUserEditFilter(string projectId, string userEditId)
        {
            var filterDef = new FilterDefinitionBuilder<StoredUserEdit>();
            return filterDef.And(filterDef.Eq(u => u.ProjectId, projectId), filterDef.Eq(u => u.Id, userEditId));
        }

        /// <summary> Creates a mongo filter for all of a user edit's <see cref="StoredEdit"/>s. </summary>
        private static FilterDefinition<StoredEdit> GetEditsFilter(string projectId, string userEditId)
        {
            var filterDef = new FilterDefinitionBuilder<StoredEdit>();
            return filterDef.And(
                filterDef.Eq(e => e.ProjectId, projectId), filterDef.Eq(e => e.UserEditId, userEditId));
        }

        /// <summary> Creates a mongo filter for a user edit's <see cref="StoredEdit"/> with specified guid. </summary>
        private static FilterDefinition<StoredEdit> GetEditFilter(string projectId, string userEditId, Guid editGuid)
        {
            var filterDef = new FilterDefinitionBuilder<StoredEdit>();
            return filterDef.And(
                filterDef.Eq(e => e.ProjectId, projectId),
                filterDef.Eq(e => e.UserEditId, userEditId),
                filterDef.Eq(e => e.Guid, editGuid));
        }

        /// <summary>
        /// Assembles a <see cref="UserEdit"/> with edits in the order of the stored references,
        /// skipping any dangling references.
        /// </summary>
        private static UserEdit AssembleUserEdit(StoredUserEdit storedUserEdit, List<StoredEdit> storedEdits)
        {
            var editsById = storedEdits.ToDictionary(e => e.Id);
            var edits = new List<Edit>();
            foreach (var editId in storedUserEdit.EditIds)
            {
                if (editsById.TryGetValue(editId, out var storedEdit))
                {
                    edits.Add(storedEdit.ToEdit());
                }
            }
            return new UserEdit { Id = storedUserEdit.Id, ProjectId = storedUserEdit.ProjectId, Edits = edits };
        }

        #endregion

        /// <summary> Finds all <see cref="UserEdit"/>s with specified projectId </summary>
        public async Task<List<UserEdit>> GetAllUserEdits(string projectId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting all user edits");

            var storedUserEdits = await _userEdits.Find(u => u.ProjectId == projectId).ToListAsync();
            var storedEdits = await _edits.Find(e => e.ProjectId == projectId).ToListAsync();
            var editsByUserEditId = storedEdits.GroupBy(e => e.UserEditId).ToDictionary(g => g.Key, g => g.ToList());
            return storedUserEdits.ConvertAll(
                u => AssembleUserEdit(u, editsByUserEditId.GetValueOrDefault(u.Id, [])));
        }

        /// <summary> Removes all <see cref="UserEdit"/>s for specified <see cref="Project"/> </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> DeleteAllUserEdits(string projectId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "deleting all user edits");

            return await _dbContext.ExecuteInTransaction(async s =>
            {
                await _edits.DeleteManyAsync(s, e => e.ProjectId == projectId);
                var deleted = await _userEdits.DeleteManyAsync(s, u => u.ProjectId == projectId);
                return deleted.DeletedCount != 0;
            });
        }

        /// <summary> Finds <see cref="UserEdit"/> with specified userEditId and projectId </summary>
        public async Task<UserEdit?> GetUserEdit(string projectId, string userEditId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting a user edit");

            var userEditList = await _userEdits.FindAsync(GetUserEditFilter(projectId, userEditId));

            StoredUserEdit storedUserEdit;
            try
            {
                storedUserEdit = await userEditList.FirstAsync();
            }
            catch (InvalidOperationException)
            {
                return null;
            }

            var storedEdits = await _edits.Find(GetEditsFilter(projectId, userEditId)).ToListAsync();
            return AssembleUserEdit(storedUserEdit, storedEdits);
        }

        /// <summary> Adds a <see cref="UserEdit"/> </summary>
        /// <returns> The UserEdit created </returns>
        public async Task<UserEdit> Create(UserEdit userEdit)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "creating a user edit");

            var storedUserEdit = new StoredUserEdit { ProjectId = userEdit.ProjectId };
            if (userEdit.Edits.Count == 0)
            {
                await _userEdits.InsertOneAsync(storedUserEdit);
            }
            else
            {
                // Pre-generate the id so the StoredEdit documents can reference their parent.
                storedUserEdit.Id = ObjectId.GenerateNewId().ToString();
                var storedEdits = userEdit.Edits.ConvertAll(
                    e => new StoredEdit(userEdit.ProjectId, storedUserEdit.Id, e));
                await _dbContext.ExecuteInTransaction(async s =>
                {
                    await _edits.InsertManyAsync(s, storedEdits);
                    storedUserEdit.EditIds = storedEdits.ConvertAll(e => e.Id);
                    await _userEdits.InsertOneAsync(s, storedUserEdit);
                    return true;
                });
            }

            userEdit.Id = storedUserEdit.Id;
            return userEdit;
        }

        /// <summary> Removes <see cref="UserEdit"/> with specified userEditId and projectId </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> Delete(string projectId, string userEditId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "deleting a user edit");

            return await _dbContext.ExecuteInTransaction(async s =>
            {
                await _edits.DeleteManyAsync(s, GetEditsFilter(projectId, userEditId));
                var deleted = await _userEdits.DeleteOneAsync(s, GetUserEditFilter(projectId, userEditId));
                return deleted.DeletedCount > 0;
            });
        }

        /// <summary>
        /// Appends an <see cref="Edit"/> to the <see cref="UserEdit"/> with specified userEditId and projectId.
        /// </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> AddEdit(string projectId, string userEditId, Edit edit)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "adding an edit to a user edit");

            var storedEdit = new StoredEdit(projectId, userEditId, edit);
            // A null result aborts the transaction, so no orphaned edit document is left behind
            // when the user edit doesn't exist.
            return await _dbContext.ExecuteInTransactionAllowNull<bool?>(async s =>
            {
                await _edits.InsertOneAsync(s, storedEdit);
                var update = Builders<StoredUserEdit>.Update.Push(u => u.EditIds, storedEdit.Id);
                var result = await _userEdits.UpdateOneAsync(s, GetUserEditFilter(projectId, userEditId), update);
                return result.IsAcknowledged && result.MatchedCount == 1 ? true : null;
            }) ?? false;
        }

        /// <summary>
        /// Replaces the contents of the <see cref="Edit"/> with matching guid in the <see cref="UserEdit"/>
        /// with specified userEditId and projectId.
        /// </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> ReplaceEdit(string projectId, string userEditId, Edit edit)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "replacing an edit in a user edit");

            var update = Builders<StoredEdit>.Update
                .Set(e => e.GoalType, edit.GoalType)
                .Set(e => e.StepData, edit.StepData)
                .Set(e => e.Changes, edit.Changes)
                .Set(e => e.Modified, edit.Modified);
            var result = await _edits.UpdateOneAsync(GetEditFilter(projectId, userEditId, edit.Guid), update);
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

            var update = Builders<StoredEdit>.Update
                .Push(e => e.StepData, stepData)
                .Set(e => e.Modified, DateTime.UtcNow);
            var result = await _edits.UpdateOneAsync(GetEditFilter(projectId, userEditId, editGuid), update);
            return result.IsAcknowledged && result.MatchedCount == 1;
        }

        /// <summary>
        /// Overwrites the step at the given index of the <see cref="Edit"/> with matching guid
        /// in the <see cref="UserEdit"/> with specified userEditId and projectId.
        /// </summary>
        /// <returns> A bool: success of operation (false if the step doesn't exist) </returns>
        public async Task<bool> UpdateStepInEdit(
            string projectId, string userEditId, Guid editGuid, int stepIndex, string stepData)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "updating a step in an edit");

            // Requiring the step to exist makes the bounds check atomic with the write;
            // a $set beyond the array's end would pad the array with nulls instead of failing.
            var filterDef = new FilterDefinitionBuilder<StoredEdit>();
            var filter = filterDef.And(
                GetEditFilter(projectId, userEditId, editGuid), filterDef.Exists($"stepData.{stepIndex}"));

            var update = Builders<StoredEdit>.Update
                .Set($"stepData.{stepIndex}", stepData)
                .Set(e => e.Modified, DateTime.UtcNow);
            var result = await _edits.UpdateOneAsync(filter, update);
            return result.IsAcknowledged && result.MatchedCount == 1;
        }
    }
}
