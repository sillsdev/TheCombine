using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Otel;
using MongoDB.Driver;

namespace BackendFramework.Repositories
{
    /// <summary> Atomic database functions for <see cref="UserRole"/>s. </summary>
    [ExcludeFromCodeCoverage]
    public class UserRoleRepository(IMongoDbContext dbContext) : IUserRoleRepository
    {
        private readonly IMongoCollection<UserRole> _userRoles =
            dbContext.Db.GetCollection<UserRole>("UserRolesCollection");

        private const string otelTagName = "otel.UserRoleRepository";

        /// <summary> Finds all <see cref="UserRole"/>s with specified projectId </summary>
        public async Task<List<UserRole>> GetAllUserRoles(string projectId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting all user roles");

            return await _userRoles.Find(u => u.ProjectId == projectId).ToListAsync();
        }

        /// <summary> Removes all <see cref="UserRole"/>s for specified <see cref="Project"/> </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> DeleteAllUserRoles(string projectId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "deleting all user roles");

            var deleted = await _userRoles.DeleteManyAsync(u => u.ProjectId == projectId);
            return deleted.DeletedCount != 0;
        }

        /// <summary> Finds <see cref="UserRole"/> with specified userRoleId and projectId </summary>
        public async Task<UserRole?> GetUserRole(string projectId, string userRoleId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting a user role");

            var filterDef = new FilterDefinitionBuilder<UserRole>();
            var filter = filterDef.And(filterDef.Eq(
                x => x.ProjectId, projectId), filterDef.Eq(x => x.Id, userRoleId));

            var userRoleList = await _userRoles.FindAsync(filter);
            try
            {
                return await userRoleList.FirstAsync();
            }
            catch (InvalidOperationException)
            {
                return null;
            }
        }

        /// <summary> Adds a <see cref="UserRole"/> </summary>
        /// <returns> The UserRole created </returns>
        public async Task<UserRole> Create(UserRole userRole)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "creating a user role");

            await _userRoles.InsertOneAsync(userRole);
            return userRole;
        }

        /// <summary> Removes <see cref="UserRole"/> with specified userRoleId and projectId </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> Delete(string projectId, string userRoleId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "deleting a user role");

            var filterDef = new FilterDefinitionBuilder<UserRole>();
            var filter = filterDef.And(filterDef.Eq(
                x => x.ProjectId, projectId), filterDef.Eq(x => x.Id, userRoleId));

            var deleted = await _userRoles.DeleteOneAsync(filter);
            return deleted.DeletedCount > 0;
        }

        /// <summary> Updates permissions of <see cref="UserRole"/> with specified userRoleId </summary>
        /// <returns> A <see cref="ResultOfUpdate"/> enum: success of operation </returns>
        public async Task<ResultOfUpdate> Update(string userRoleId, UserRole userRole)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "updating a user role");

            var filter = Builders<UserRole>.Filter.Eq(x => x.Id, userRoleId);
            var updateDef = Builders<UserRole>.Update.Set(x => x.Role, userRole.Role);
            var updateResult = await _userRoles.UpdateOneAsync(filter, updateDef);

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
    }
}
