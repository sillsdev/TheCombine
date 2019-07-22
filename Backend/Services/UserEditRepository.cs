using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BackendFramework.Services
{
    public class UserEditRepository : IUserEditRepository
    {
        private readonly IUserEditContext _userEditDatabase;

        public UserEditRepository(IUserEditContext collectionSettings)
        {
            _userEditDatabase = collectionSettings;
        }

        public async Task<List<UserEdit>> GetAllUserEdits(string projectId)
        {
            return await _userEditDatabase.UserEdits.Find(u => u.ProjectId == projectId).ToListAsync();
        }

        public async Task<bool> DeleteAllUserEdits(string projectId)
        {
            var deleted = await _userEditDatabase.UserEdits.DeleteManyAsync(u => u.ProjectId == projectId);
            if(deleted.DeletedCount != 0)
            {
                return true;
            }
            return false;
        }

        public async Task<UserEdit> GetUserEdit(string projectId, string userEditId)
        {
            var filterDef = new FilterDefinitionBuilder<UserEdit>();
            var filter = filterDef.And(filterDef.Eq(x => x.ProjectId, projectId), filterDef.Eq(x => x.Id, userEditId));

            var userEditList = await _userEditDatabase.UserEdits.FindAsync(filter);
                        
            return userEditList.FirstOrDefault();
        }

        public async Task<UserEdit> Create(UserEdit userEdit)
        {
            await _userEditDatabase.UserEdits.InsertOneAsync(userEdit);
            return userEdit;
        }

        public async Task<bool> Delete(string projectId, string userEditId)
        {
            var filterDef = new FilterDefinitionBuilder<UserEdit>();
            var filter = filterDef.And(filterDef.Eq(x => x.ProjectId, projectId), filterDef.Eq(x => x.Id, userEditId));

            var deleted = await _userEditDatabase.UserEdits.DeleteOneAsync(filter);
            return deleted.DeletedCount > 0;
        }

        public async Task<bool> Replace(string projectId, string userEditId, UserEdit userEdit)
        {
            var filterDef = new FilterDefinitionBuilder<UserEdit>();
            var filter = filterDef.And(filterDef.Eq(x => x.ProjectId, projectId), filterDef.Eq(x => x.Id, userEditId));

            var result = await _userEditDatabase.UserEdits.ReplaceOneAsync(filter, userEdit);
            return result.IsAcknowledged && result.ModifiedCount == 1;
        }
    }
}