using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Tests
{
    public class UserEditServiceMock : IUserEditService
    {

        List<UserEdit> userEdits;

        public UserEditServiceMock()
        {
            userEdits = new List<UserEdit>();
        }

        public Task<List<UserEdit>> GetAllUserEdits()
        {
            return Task.FromResult(userEdits.Select(userEdit => userEdit.Clone()).ToList());
        }

        public Task<UserEdit> GetUserEdit(string id)
        {
            var foundUserEdit = userEdits.Where(userEdit => userEdit.Id == id).Single();
            return Task.FromResult(foundUserEdit.Clone());
        }

        public Task<UserEdit> Create(UserEdit userEdit)
        {
            userEdit.Id = Guid.NewGuid().ToString();
            userEdits.Add(userEdit.Clone());
            return Task.FromResult(userEdit.Clone());
        }

        public Task<bool> DeleteAllUserEdits()
        {
            userEdits.Clear();
            return Task.FromResult(true);
        }

        public Task<bool> Delete(string Id)
        {
            var foundUserEdit = userEdits.Single(userEdit => userEdit.Id == Id);
            var success = userEdits.Remove(foundUserEdit);
            return Task.FromResult(success);
        }

        public Task<bool> Update(string Id, int goalIndex, string stepUpdate)
        {
            var foundUserEdit = userEdits.Single(u => u.Id == Id);

            if (foundUserEdit != null)
            {
                foundUserEdit.Edits[goalIndex].StepData.Add(stepUpdate);
                return Task.FromResult(true);
            }
            return Task.FromResult(false);
        }
    }
}
