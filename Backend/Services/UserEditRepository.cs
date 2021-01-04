using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Services
{
    /// <summary> Atomic database functions for <see cref="UserEdit"/>s </summary>
    public class UserEditRepository : IUserEditRepository
    {
        private readonly IUserEditContext _userEditDatabase;

        public UserEditRepository(IUserEditContext collectionSettings)
        {
            _userEditDatabase = collectionSettings;
        }

        /// <summary> Finds all <see cref="UserEdit"/>s with specified projectId </summary>
        public async Task<List<UserEdit>> GetAllUserEdits(string projectId)
        {
            return await _userEditDatabase.UserEdits.Find(u => u.ProjectId == projectId).ToListAsync();
        }

        /// <summary> Removes all <see cref="UserEdit"/>s for specified <see cref="Project"/> </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> DeleteAllUserEdits(string projectId)
        {
            var deleted = await _userEditDatabase.UserEdits.DeleteManyAsync(u => u.ProjectId == projectId);
            return deleted.DeletedCount != 0;
        }

        /// <summary> Finds <see cref="UserEdit"/> with specified userRoleId and projectId </summary>
        public async Task<UserEdit?> GetUserEdit(string projectId, string userEditId)
        {
            var filterDef = new FilterDefinitionBuilder<UserEdit>();
            var filter = filterDef.And(filterDef.Eq(
                x => x.ProjectId, projectId), filterDef.Eq(x => x.Id, userEditId));

            var userEditList = await _userEditDatabase.UserEdits.FindAsync(filter);

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
            await _userEditDatabase.UserEdits.InsertOneAsync(userEdit);
            return userEdit;
        }

        /// <summary> Removes <see cref="UserEdit"/> with specified userRoleId and projectId </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> Delete(string projectId, string userEditId)
        {
            var filterDef = new FilterDefinitionBuilder<UserEdit>();
            var filter = filterDef.And(filterDef.Eq(
                x => x.ProjectId, projectId), filterDef.Eq(x => x.Id, userEditId));

            var deleted = await _userEditDatabase.UserEdits.DeleteOneAsync(filter);
            return deleted.DeletedCount > 0;
        }

        /// <summary> Replaces <see cref="UserEdit"/> with specified userRoleId and projectId </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> Replace(string projectId, string userEditId, UserEdit userEdit)
        {
            var filterDef = new FilterDefinitionBuilder<UserEdit>();
            var filter = filterDef.And(filterDef.Eq(
                x => x.ProjectId, projectId), filterDef.Eq(x => x.Id, userEditId));

            var result = await _userEditDatabase.UserEdits.ReplaceOneAsync(filter, userEdit);
            return result.IsAcknowledged && result.ModifiedCount == 1;
        }
    }
}
