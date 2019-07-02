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

        public async Task<List<UserEdit>> GetAllUserEdits()
        {
            return await _userEditDatabase.UserEdits.Find(_ => true).ToListAsync();
        }

        public async Task<bool> DeleteAllUserEdits()
        {
            var deleted = await _userEditDatabase.UserEdits.DeleteManyAsync(_ => true);
            if(deleted.DeletedCount != 0)
            {
                return true;
            }
            return false;
        }

        public async Task<UserEdit> GetUserEdit(string Id)
        {
            var filterDef = new FilterDefinitionBuilder<UserEdit>();
            var filter = filterDef.Eq(x => x.Id, Id);

            var userEditList = await _userEditDatabase.UserEdits.FindAsync(filter);
                        
            return userEditList.FirstOrDefault();
        }

        public async Task<UserEdit> Create(UserEdit userEdit)
        {
            await _userEditDatabase.UserEdits.InsertOneAsync(userEdit);
            return userEdit;
        }

        public async Task<bool> Delete(string Id)
        {
            var deleted = await _userEditDatabase.UserEdits.DeleteManyAsync(x => x.Id == Id);
            return deleted.DeletedCount > 0;
        }

        public async Task<bool> Replace(string Id, UserEdit userEdit)
        {
            var filterDef = new FilterDefinitionBuilder<UserEdit>();
            var filter = filterDef.Eq(x => x.Id, Id);
            var result = await _userEditDatabase.UserEdits.ReplaceOneAsync(filter, userEdit);
            return result.IsAcknowledged && result.ModifiedCount == 1;
        }
    }
}