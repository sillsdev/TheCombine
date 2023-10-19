using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;

namespace Backend.Tests.Mocks
{
    public class UserEditRepositoryMock : IUserEditRepository
    {
        private readonly List<UserEdit> _userEdits;

        public UserEditRepositoryMock()
        {
            _userEdits = new List<UserEdit>();
        }

        public Task<List<UserEdit>> GetAllEntries(string projectId)
        {
            var list = _userEdits.Where(userEdit => userEdit.ProjectId == projectId).ToList();
            return Task.FromResult(list.Select(userEdit => userEdit.Clone()).ToList());
        }

        public Task<UserEdit?> GetEntry(string projectId, string entryId)
        {
            try
            {
                var foundUserEdit = _userEdits.Single(ue => ue.Id == entryId);
                return Task.FromResult<UserEdit?>(foundUserEdit.Clone());
            }
            catch (InvalidOperationException)
            {
                return Task.FromResult<UserEdit?>(null);
            }
        }

        public Task<UserEdit> Create(UserEdit entry)
        {
            entry.Id = Guid.NewGuid().ToString();
            _userEdits.Add(entry.Clone());
            return Task.FromResult(entry.Clone());
        }

        public Task<bool> DeleteAll(string projectId)
        {
            _userEdits.Clear();
            return Task.FromResult(true);
        }

        public Task<bool> Delete(string projectId, string entryId)
        {
            try
            {
                var foundUserEdit = _userEdits.Single(userEdit => userEdit.Id == entryId);
                return Task.FromResult(_userEdits.Remove(foundUserEdit));
            }
            catch (InvalidOperationException)
            {
                return Task.FromResult(false);
            }
        }

        public Task<bool> Replace(string projectId, string entryId, UserEdit entry)
        {
            var foundUserEdit = _userEdits.Single(ue => ue.Id == entryId);
            var success = _userEdits.Remove(foundUserEdit);
            _userEdits.Add(entry);
            return Task.FromResult(success);
        }
    }
}
