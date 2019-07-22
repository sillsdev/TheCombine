﻿using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Tests
{
    public class UserRoleServiceMock : IUserRoleService
    {
        private readonly List<UserRole> _userRoles;

        public UserRoleServiceMock()
        {
            _userRoles = new List<UserRole>();
        }

        public Task<List<UserRole>> GetAllUserRoles(string projectId)
        {
            var cloneList = _userRoles.Select(userRole => userRole.Clone()).ToList();
            return Task.FromResult(cloneList.Where(userRole => userRole.ProjectId == projectId).ToList());
        }

        public Task<UserRole> GetUserRole(string projectId, string userRoleId)
        {
            var foundUserRole = _userRoles.Single(userRole => userRole.Id == userRoleId);
            return Task.FromResult(foundUserRole.Clone());
        }

        public Task<UserRole> Create(UserRole userRole)
        {
            userRole.Id = Guid.NewGuid().ToString();
            _userRoles.Add(userRole.Clone());
            return Task.FromResult(userRole.Clone());
        }

        public Task<bool> DeleteAllUserRoles(string projectId)
        {
            _userRoles.Clear();
            return Task.FromResult(true);
        }

        public Task<bool> Delete(string projectId, string userRoleId)
        {
            var foundUserRole = _userRoles.Single(userRole => userRole.Id == userRoleId);
            return Task.FromResult(_userRoles.Remove(foundUserRole));
        }

        public Task<ResultOfUpdate> Update(string userRoleId, UserRole userRole)
        {
            var foundUserRole = _userRoles.Single(ur => ur.Id == userRoleId);
            var success = _userRoles.Remove(foundUserRole);
            if (success)
            {
                _userRoles.Add(userRole.Clone());
                return Task.FromResult(ResultOfUpdate.Updated);
            }
            return Task.FromResult(ResultOfUpdate.NotFound);
        }
    }
}
