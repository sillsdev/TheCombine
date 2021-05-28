using System.Collections.Generic;
using Backend.Tests.Mocks;
using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;

namespace Backend.Tests.Controllers
{
    public class UserRoleControllerTests
    {
        private IProjectRepository _projRepo = null!;
        private IUserRepository _userRepo = null!;
        private IUserRoleRepository _userRoleRepo = null!;
        private IPermissionService _permissionService = null!;
        private UserRoleController _userRoleController = null!;

        private string _projId = null!;
        private const string InvalidProjectId = "INVALID_PROJECT_ID";

        [SetUp]
        public void Setup()
        {
            _projRepo = new ProjectRepositoryMock();
            _userRepo = new UserRepositoryMock();
            _userRoleRepo = new UserRoleRepositoryMock();
            _permissionService = new PermissionServiceMock();
            _userRoleController = new UserRoleController(_userRepo, _userRoleRepo, _projRepo, _permissionService);

            _projId = _projRepo.Create(new Project { Name = "UserRoleControllerTests" }).Result!.Id;
        }

        private UserRole RandomUserRole()
        {
            var userRole = new UserRole
            {
                ProjectId = _projId,
                Permissions = new List<int>
                {
                    (int)Permission.DeleteEditSettingsAndUsers,
                    (int)Permission.ImportExport,
                    (int)Permission.MergeAndCharSet
                }
            };
            return userRole;
        }

        [Test]
        public void TestGetAllUserRoles()
        {
            _userRoleRepo.Create(RandomUserRole());
            _userRoleRepo.Create(RandomUserRole());
            _userRoleRepo.Create(RandomUserRole());

            var getResult = _userRoleController.Get(_projId).Result;

            Assert.IsInstanceOf<ObjectResult>(getResult);

            var roles = ((ObjectResult)getResult).Value as List<UserRole>;
            Assert.That(roles, Has.Count.EqualTo(3));
            _userRoleRepo.GetAllUserRoles(_projId).Result.ForEach(role => Assert.Contains(role, roles));
        }

        [Test]
        public void TestGetAllUserRolesMissingProject()
        {
            var result = _userRoleController.Get(InvalidProjectId).Result;
            Assert.IsInstanceOf<NotFoundObjectResult>(result);
        }

        [Test]
        public void TestGetAllUserRolesNoPermission()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _userRoleController.Get(_projId).Result;
            Assert.IsInstanceOf<ForbidResult>(result);
        }

        [Test]
        public void TestGetUserRole()
        {
            var userRole = _userRoleRepo.Create(RandomUserRole()).Result;

            _userRoleRepo.Create(RandomUserRole());
            _userRoleRepo.Create(RandomUserRole());

            var action = _userRoleController.Get(_projId, userRole.Id).Result;
            Assert.IsInstanceOf<ObjectResult>(action);

            var foundUserRole = ((ObjectResult)action).Value as UserRole;
            Assert.AreEqual(userRole, foundUserRole);
        }

        [Test]
        public void TestGetMissingUserRole()
        {
            var action = _userRoleController.Get(_projId, "INVALID_USER_ROLE_ID").Result;
            Assert.IsInstanceOf<NotFoundObjectResult>(action);
        }

        [Test]
        public void TestGetUserRolesMissingProject()
        {
            var userRole = _userRoleRepo.Create(RandomUserRole()).Result;
            var result = _userRoleController.Get(InvalidProjectId, userRole.Id).Result;
            Assert.IsInstanceOf<NotFoundObjectResult>(result);
        }

        [Test]
        public void TestGetUserRolesNoPermission()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var userRole = _userRoleRepo.Create(RandomUserRole()).Result;
            var result = _userRoleController.Get(_projId, userRole.Id).Result;
            Assert.IsInstanceOf<ForbidResult>(result);
        }

        [Test]
        public void TestCreateUserRole()
        {
            var userRole = RandomUserRole();
            var id = (string)((ObjectResult)_userRoleController.Post(_projId, userRole).Result).Value;
            userRole.Id = id;
            Assert.Contains(userRole, _userRoleRepo.GetAllUserRoles(_projId).Result);
        }

        [Test]
        public void TestCreateUserRolesMissingProject()
        {
            var userRole = RandomUserRole();
            var result = _userRoleController.Post(InvalidProjectId, userRole).Result;
            Assert.IsInstanceOf<NotFoundObjectResult>(result);
        }

        [Test]
        public void TestCreateUserRolesNoPermission()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var userRole = _userRoleRepo.Create(RandomUserRole()).Result;
            var result = _userRoleController.Post(_projId, userRole).Result;
            Assert.IsInstanceOf<ForbidResult>(result);
        }

        [Test]
        public void TestUpdateUserRole()
        {
            var userRole = RandomUserRole();
            _userRoleRepo.Create(userRole);
            var user = new User { ProjectRoles = { [_projId] = userRole.Id } };
            var userId = _userRepo.Create(user).Result!.Id;

            var updatePermissions = userRole.Clone().Permissions;
            updatePermissions.Add((int)Permission.WordEntry);

            _ = _userRoleController.UpdateUserRole(_projId, userId, updatePermissions.ToArray()).Result;
            var action = _userRoleController.Get(_projId, userRole.Id).Result;
            var updatedUserRole = ((ObjectResult)action).Value as UserRole;
            Assert.AreEqual(updatePermissions, updatedUserRole?.Permissions);
        }

        [Test]
        public void TestUpdateUserRolesMissingProject()
        {
            var userRole = RandomUserRole();
            var result = _userRoleController.UpdateUserRole(
                InvalidProjectId, userRole.Id, userRole.Permissions.ToArray()).Result;
            Assert.IsInstanceOf<NotFoundObjectResult>(result);
        }

        [Test]
        public void TestUpdateUserRolesNoPermission()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var userRole = RandomUserRole();
            var result = _userRoleController.UpdateUserRole(
                InvalidProjectId, userRole.Id, userRole.Permissions.ToArray()).Result;
            Assert.IsInstanceOf<ForbidResult>(result);
        }

        [Test]
        public void TestDeleteUserRole()
        {
            var origUserRole = _userRoleRepo.Create(RandomUserRole()).Result;

            Assert.That(_userRoleRepo.GetAllUserRoles(_projId).Result, Has.Count.EqualTo(1));

            _ = _userRoleController.Delete(_projId, origUserRole.Id).Result;

            Assert.That(_userRoleRepo.GetAllUserRoles(_projId).Result, Has.Count.EqualTo(0));
        }

        [Test]
        public void TestDeleteUserRoleNoPermission()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var userRole = _userRoleRepo.Create(RandomUserRole()).Result;
            var result = _userRoleController.Delete(_projId, userRole.Id).Result;
            Assert.IsInstanceOf<ForbidResult>(result);
        }

        [Test]
        public void TestDeleteAllUserRoles()
        {
            _userRoleRepo.Create(RandomUserRole());
            _userRoleRepo.Create(RandomUserRole());
            _userRoleRepo.Create(RandomUserRole());

            Assert.That(_userRoleRepo.GetAllUserRoles(_projId).Result, Has.Count.EqualTo(3));

            _ = _userRoleController.Delete(_projId).Result;

            Assert.That(_userRoleRepo.GetAllUserRoles(_projId).Result, Has.Count.EqualTo(0));
        }

        [Test]
        public void TestDeleteAllUserRolesMissingProject()
        {
            var result = _userRoleController.Delete(InvalidProjectId).Result;
            Assert.IsInstanceOf<NotFoundObjectResult>(result);
        }

        [Test]
        public void TestDeleteAllUserRolesNoPermission()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _userRoleController.Delete(_projId).Result;
            Assert.IsInstanceOf<ForbidResult>(result);
        }
    }
}
