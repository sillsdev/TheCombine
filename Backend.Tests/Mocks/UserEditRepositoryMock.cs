﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;

namespace Backend.Tests.Mocks
{
    internal sealed class UserEditRepositoryMock : IUserEditRepository
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

        public Task<UserEdit?> GetUserEdit(string projectId, string userEditId)
        {
            try
            {
                var foundUserEdit = _userEdits.Single(ue => ue.Id == userEditId);
                return Task.FromResult<UserEdit?>(foundUserEdit.Clone());
            }
            catch (InvalidOperationException)
            {
                return Task.FromResult<UserEdit?>(null);
            }
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
            var rmCount = _userEdits.RemoveAll(userEdit => userEdit.Id == userEditId);
            return Task.FromResult(rmCount > 0);
        }

        public Task<bool> Replace(string projectId, string userEditId, UserEdit userEdit)
        {
            var rmCount = _userEdits.RemoveAll(ue => ue.Id == userEditId);
            _userEdits.Add(userEdit);
            return Task.FromResult(rmCount > 0);
        }
    }
}
