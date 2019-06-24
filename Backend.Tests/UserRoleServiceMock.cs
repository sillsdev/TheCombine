using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Tests
{
    public class UserRoleServiceMock : IUserRoleService
    {

        List<UserRole> userRoles;

        public UserRoleServiceMock()
        {
            userRoles = new List<UserRole>();
        }

        public Task<List<UserRole>> GetAllUserRoles()
        {
            return Task.FromResult(userRoles.Select(userRole => userRole.Clone()).ToList());
        }

        public Task<UserRole> GetUserRole(string id)
        {
            var foundUserRole = userRoles.Where(userRole => userRole.Id == id).Single();
            return Task.FromResult(foundUserRole.Clone());
        }

        public Task<UserRole> Create(UserRole userRole)
        {
            userRole.Id = Guid.NewGuid().ToString();
            userRoles.Add(userRole.Clone());
            return Task.FromResult(userRole.Clone());
        }

        public Task<bool> DeleteAllUserRoles()
        {
            userRoles.Clear();
            return Task.FromResult(true);
        }

        public Task<bool> Delete(string Id)
        {
            var foundUserRole = userRoles.Single(userRole => userRole.Id == Id);
            var success = userRoles.Remove(foundUserRole);
            return Task.FromResult(success);
        }

        public Task<bool> Update(string Id, UserRole userRole)
        {
            var foundUserRole = userRoles.Single(u => u.Id == Id);
            var success = userRoles.Remove(foundUserRole);
            if (success)
            {
                userRoles.Add(userRole.Clone());
            }
            return Task.FromResult(success);
        }
    }
}
