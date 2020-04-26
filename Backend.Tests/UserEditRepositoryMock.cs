using BackendFramework.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Models;

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
            var cloneList = _userEdits.Select(userEdit => userEdit.Clone()).ToList();
            return Task.FromResult(cloneList.Where(userEdit => userEdit.ProjectId == projectId).ToList());
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
            return Task.FromResult(_userEdits.Remove(foundUserEdit));
        }

        public Task<bool> Replace(string projectId, string userEditId, UserEdit userEdit)
        {
            UserEdit foundUserEdit = _userEdits.Single(ue => ue.Id == userEditId);
            bool success = _userEdits.Remove(foundUserEdit);
            _userEdits.Add(userEdit);
            return Task.FromResult(success);
        }
    }
}
