using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Tests
{
    public class UserEditRepositoryMock : IUserEditRepository
    {
        private readonly List<UserEdit> userEdits;

        public UserEditRepositoryMock()
        {
            userEdits = new List<UserEdit>();
        }

        public Task<List<UserEdit>> GetAllUserEdits()
        {
            return Task.FromResult(userEdits.Select(userEdit => userEdit.Clone()).ToList());
        }

        public Task<UserEdit> GetUserEdit(string id)
        {
            var foundUserEdit = userEdits.Where(userEdit => userEdit.Id == id).FirstOrDefault();
            if (foundUserEdit == null)
            {
                return Task.FromResult(foundUserEdit);
            }
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

        public Task<bool> Replace(string Id, UserEdit userEdit)
        {
            var foundUserEdit = userEdits.Single(ue => ue.Id == Id);
            var success = userEdits.Remove(foundUserEdit);
            userEdits.Add(userEdit);
            return Task.FromResult(success);
        }
    }
}
