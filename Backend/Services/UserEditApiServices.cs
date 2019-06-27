using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BackendFramework.Services
{
    public class UserEditService : IUserEditService
    {
        private readonly IUserEditContext _userEditDatabase;

        public UserEditService(IUserEditContext collectionSettings)
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

        public async Task<bool> Update(string Id, UserEdit userEdit)
        {
            FilterDefinition<UserEdit> filter = Builders<UserEdit>.Filter.Eq(x => x.Id, Id);

            UserEdit updatedUserEdit = new UserEdit();

            //Note: Nulls out values not in update body
            var updateDef = Builders<UserEdit>.Update.Set(x => x.Edits, userEdit.Edits);

            var updateResult = await _userEditDatabase.UserEdits.UpdateOneAsync(filter, updateDef);

            return updateResult.IsAcknowledged && updateResult.ModifiedCount == 1;
           
        }
    }


}