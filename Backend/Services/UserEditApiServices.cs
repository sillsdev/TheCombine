using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using MongoDB.Driver;
using System;
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

        public async Task<Tuple<bool, int>> AddEditsToUserEdit(string Id, Edit edit)
        {
            //get userEdit to change
            var userEntry = await GetUserEdit(Id);

            //add the new goal index to Edits list
            userEntry.Edits.Add(edit);

            //replace the old UserEdit object with the new one that contains  the new list entry
            FilterDefinition<UserEdit> filter = Builders<UserEdit>.Filter.Eq(x => x.Id, Id);
            var updateResult = _userEditDatabase.UserEdits.ReplaceOne(filter, userEntry);

            //ensure the replacement has been made
            bool validation = updateResult.IsAcknowledged && updateResult.ModifiedCount == 1;
            int indexOfNewestEdit = -1;

            if (validation)
            {
                var newestEdit = await _userEditDatabase.UserEdits.FindAsync(filter);
                indexOfNewestEdit = newestEdit.Single().Edits.Count -1;
            }

            return new Tuple<bool, int>(validation, indexOfNewestEdit);
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

        public async Task<bool> Update(string Id, int goalIndex, string userEdit)
        {
            FilterDefinition<UserEdit> filter = Builders<UserEdit>.Filter.Eq(x => x.Id, Id);

            UserEdit AddUserEdit = await GetUserEdit(Id);

            AddUserEdit.Edits[goalIndex].StepData.Add(userEdit);

            var updateResult = _userEditDatabase.UserEdits.ReplaceOne(filter, AddUserEdit);

            return updateResult.IsAcknowledged && updateResult.ModifiedCount == 1;
           
        }
    }


}