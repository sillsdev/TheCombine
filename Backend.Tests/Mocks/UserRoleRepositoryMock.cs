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

        public Task<List<UserRole>> GetAllEntries(string projectId)
        {
            var cloneList = _userRoles.Select(userRole => userRole.Clone()).ToList();
            return Task.FromResult(cloneList.Where(userRole => userRole.ProjectId == projectId).ToList());
        }

        public Task<UserRole?> GetEntry(string projectId, string entryId)
        {
            try
            {
                var foundUserRole = _userRoles.Single(userRole => userRole.Id == entryId);
                return Task.FromResult<UserRole?>(foundUserRole.Clone());
            }
            catch (InvalidOperationException)
            {
                return Task.FromResult<UserRole?>(null);
            }
        }

        public Task<UserRole> Create(UserRole entry)
        {
            entry.Id = Guid.NewGuid().ToString();
            _userRoles.Add(entry.Clone());
            return Task.FromResult(entry.Clone());
        }

        public Task<bool> DeleteAll(string projectId)
        {
            _userRoles.Clear();
            return Task.FromResult(true);
        }

        public Task<bool> Delete(string projectId, string entryId)
        {
            var foundUserRole = _userRoles.Single(userRole => userRole.Id == entryId);
            return Task.FromResult(_userRoles.Remove(foundUserRole));
        }

        public Task<ResultOfUpdate> Update(string entryId, UserRole entry)
        {
            var foundUserRole = _userRoles.Single(ur => ur.Id == entryId);
            if (foundUserRole is null)
            {
                return Task.FromResult(ResultOfUpdate.NotFound);
            }

            if (foundUserRole.ContentEquals(entry))
            {
                return Task.FromResult(ResultOfUpdate.NoChange);
            }

            var success = _userRoles.Remove(foundUserRole);
            if (!success)
            {
                return Task.FromResult(ResultOfUpdate.NotFound);
            }

            _userRoles.Add(entry.Clone());
            return Task.FromResult(ResultOfUpdate.Updated);
        }
    }
}
