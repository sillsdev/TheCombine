using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;

namespace Backend.Tests.Mocks
{
    public class UserRoleRepositoryMock : IUserRoleRepository
    {
        private readonly List<UserRole> _userRoles;

        public UserRoleRepositoryMock()
        {
            _userRoles = new List<UserRole>();
        }

        public Task<List<UserRole>> GetAllUserRoles(string projectId)
        {
            var cloneList = _userRoles.Select(userRole => userRole.Clone()).ToList();
            return Task.FromResult(cloneList.Where(userRole => userRole.ProjectId == projectId).ToList());
        }

        public Task<UserRole?> GetUserRole(string projectId, string userRoleId)
        {
            try
            {
                var foundUserRole = _userRoles.Single(userRole => userRole.Id == userRoleId);
                return Task.FromResult<UserRole?>(foundUserRole.Clone());
            }
            catch (InvalidOperationException)
            {
                return Task.FromResult<UserRole?>(null);
            }
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
            if (!success)
            {
                return Task.FromResult(ResultOfUpdate.NotFound);
            }

            _userRoles.Add(userRole.Clone());
            return Task.FromResult(ResultOfUpdate.Updated);
        }
    }
}
