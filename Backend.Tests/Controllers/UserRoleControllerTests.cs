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
                Permissions = new List<Permission>
                {
                    Permission.DeleteEditSettingsAndUsers,
                    Permission.ImportExport,
                    Permission.MergeAndCharSet
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

            var getResult = _userRoleController.GetProjectUserRoles(_projId).Result;

            Assert.IsInstanceOf<ObjectResult>(getResult);

            var roles = ((ObjectResult)getResult).Value as List<UserRole>;
            Assert.That(roles, Has.Count.EqualTo(3));
            _userRoleRepo.GetAllUserRoles(_projId).Result.ForEach(role => Assert.Contains(role, roles));
        }

        [Test]
        public void TestGetAllUserRolesMissingProject()
        {
            var result = _userRoleController.GetProjectUserRoles(InvalidProjectId).Result;
            Assert.IsInstanceOf<NotFoundObjectResult>(result);
        }

        [Test]
        public void TestGetAllUserRolesNoPermission()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _userRoleController.GetProjectUserRoles(_projId).Result;
            Assert.IsInstanceOf<ForbidResult>(result);
        }

        [Test]
        public void TestGetUserRole()
        {
            var userRole = _userRoleRepo.Create(RandomUserRole()).Result;

            _userRoleRepo.Create(RandomUserRole());
            _userRoleRepo.Create(RandomUserRole());

            var action = _userRoleController.GetUserRole(_projId, userRole.Id).Result;
            Assert.IsInstanceOf<ObjectResult>(action);

            var foundUserRole = ((ObjectResult)action).Value as UserRole;
            Assert.AreEqual(userRole, foundUserRole);
        }

        [Test]
        public void TestGetMissingUserRole()
        {
            var action = _userRoleController.GetUserRole(_projId, "INVALID_USER_ROLE_ID").Result;
            Assert.IsInstanceOf<NotFoundObjectResult>(action);
        }

        [Test]
        public void TestGetUserRolesMissingProject()
        {
            var userRole = _userRoleRepo.Create(RandomUserRole()).Result;
            var result = _userRoleController.GetUserRole(InvalidProjectId, userRole.Id).Result;
            Assert.IsInstanceOf<NotFoundObjectResult>(result);
        }

        [Test]
        public void TestGetUserRolesNoPermission()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var userRole = _userRoleRepo.Create(RandomUserRole()).Result;
            var result = _userRoleController.GetUserRole(_projId, userRole.Id).Result;
            Assert.IsInstanceOf<ForbidResult>(result);
        }

        [Test]
        public void TestCreateUserRole()
        {
            var userRole = RandomUserRole();
            var id = (string)((ObjectResult)_userRoleController.CreateUserRole(_projId, userRole).Result).Value;
            userRole.Id = id;
            Assert.Contains(userRole, _userRoleRepo.GetAllUserRoles(_projId).Result);
        }

        [Test]
        public void TestCreateUserRolesMissingProject()
        {
            var userRole = RandomUserRole();
            var result = _userRoleController.CreateUserRole(InvalidProjectId, userRole).Result;
            Assert.IsInstanceOf<NotFoundObjectResult>(result);
        }

        [Test]
        public void TestCreateUserRolesNoPermission()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var userRole = _userRoleRepo.Create(RandomUserRole()).Result;
            var result = _userRoleController.CreateUserRole(_projId, userRole).Result;
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
            updatePermissions.Add(Permission.WordEntry);

            _ = _userRoleController.UpdateUserRolePermissions(_projId, userId, updatePermissions.ToArray()).Result;
            var action = _userRoleController.GetUserRole(_projId, userRole.Id).Result;
            var updatedUserRole = ((ObjectResult)action).Value as UserRole;
            Assert.AreEqual(updatePermissions, updatedUserRole?.Permissions);
        }

        [Test]
        public void TestUpdateUserRolesMissingProject()
        {
            var userRole = RandomUserRole();
            var result = _userRoleController.UpdateUserRolePermissions(
                InvalidProjectId, userRole.Id, userRole.Permissions.ToArray()).Result;
            Assert.IsInstanceOf<NotFoundObjectResult>(result);
        }

        [Test]
        public void TestUpdateUserRolesNoPermission()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var userRole = RandomUserRole();
            var result = _userRoleController.UpdateUserRolePermissions(
                InvalidProjectId, userRole.Id, userRole.Permissions.ToArray()).Result;
            Assert.IsInstanceOf<ForbidResult>(result);
        }

        [Test]
        public void TestDeleteUserRole()
        {
            var userRole = RandomUserRole();
            _userRoleRepo.Create(userRole);
            var user = new User { ProjectRoles = { [_projId] = userRole.Id } };
            var userId = _userRepo.Create(user).Result!.Id;

            Assert.That(_userRoleRepo.GetAllUserRoles(_projId).Result, Has.Count.EqualTo(1));
            var fetchedUser = _userRepo.GetUser(userId).Result ?? throw new System.Exception();
            Assert.That(fetchedUser.ProjectRoles.ContainsKey(_projId));
            Assert.That(fetchedUser.ProjectRoles.ContainsValue(userRole.Id));

            _ = _userRoleController.DeleteUserRole(_projId, userId).Result;

            Assert.That(_userRoleRepo.GetAllUserRoles(_projId).Result, Has.Count.EqualTo(0));
            fetchedUser = _userRepo.GetUser(userId).Result ?? throw new System.Exception();
            Assert.False(fetchedUser.ProjectRoles.ContainsKey(_projId));
            Assert.False(fetchedUser.ProjectRoles.ContainsValue(userRole.Id));
        }

        [Test]
        public void TestDeleteUserRoleNoPermission()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var userRole = _userRoleRepo.Create(RandomUserRole()).Result;
            var result = _userRoleController.DeleteUserRole(_projId, userRole.Id).Result;
            Assert.IsInstanceOf<ForbidResult>(result);
        }

        [Test]
        public void TestDeleteAllUserRoles()
        {
            _userRoleRepo.Create(RandomUserRole());
            _userRoleRepo.Create(RandomUserRole());
            _userRoleRepo.Create(RandomUserRole());

            Assert.That(_userRoleRepo.GetAllUserRoles(_projId).Result, Has.Count.EqualTo(3));

            _ = _userRoleController.DeleteProjectUserRoles(_projId).Result;

            Assert.That(_userRoleRepo.GetAllUserRoles(_projId).Result, Has.Count.EqualTo(0));
        }

        [Test]
        public void TestDeleteAllUserRolesMissingProject()
        {
            var result = _userRoleController.DeleteProjectUserRoles(InvalidProjectId).Result;
            Assert.IsInstanceOf<NotFoundObjectResult>(result);
        }

        [Test]
        public void TestDeleteAllUserRolesNoPermission()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _userRoleController.DeleteProjectUserRoles(_projId).Result;
            Assert.IsInstanceOf<ForbidResult>(result);
        }
    }
}
