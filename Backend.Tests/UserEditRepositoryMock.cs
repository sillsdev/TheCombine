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
        private readonly List<UserEdit> _userEdits;

        public UserEditRepositoryMock()
        {
            _userEdits = new List<UserEdit>();
        }

        public Task<List<UserEdit>> GetAllUserEdits(string projectId)
        {
            return Task.FromResult(_userEdits.Select(userEdit => userEdit.Clone()).ToList());
        }

        public Task<UserEdit> GetUserEdit(string projectId, string userEditId)
        {
            var foundUserEdit = _userEdits.Where(ue => ue.Id == userEditId).Single();
            return Task.FromResult(foundUserEdit.Clone());
        }

        public Task<UserEdit> Create(UserEdit userEdit)
        {
            userEdit.Id = Guid.NewGuid().ToString();
            _userEdits.Add(userEdit.Clone());
            return Task.FromResult(userEdit.Clone());
        }

        public Task<bool> DeleteAllUserEdits(string projectId)
        {
            _userEdits.Clear();
            return Task.FromResult(true);
        }

        public Task<bool> Delete(string projectId, string userEditId)
        {
            var foundUserEdit = _userEdits.Single(userEdit => userEdit.Id == userEditId);
            var success = _userEdits.Remove(foundUserEdit);
            return Task.FromResult(success);
        }

        public Task<bool> Replace(string projectId, string userEditId, UserEdit userEdit)
        {
            var foundUserEdit = _userEdits.Single(ue => ue.Id == userEditId);
            var success = _userEdits.Remove(foundUserEdit);
            _userEdits.Add(userEdit);
            return Task.FromResult(success);
        }
    }
}
