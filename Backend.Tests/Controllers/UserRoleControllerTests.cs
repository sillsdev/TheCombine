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
        private IUserRoleService _userRoleService = null!;
        private UserRoleController _userRoleController = null!;

        private IProjectService _projectService = null!;
        private string _projId = null!;
        private IPermissionService _permissionService = null!;

        private const string InvalidProjectId = "INVALID_PROJECT_ID";

        [SetUp]
        public void Setup()
        {
            _permissionService = new PermissionServiceMock();
            _userRoleService = new UserRoleServiceMock();
            _projectService = new ProjectServiceMock();
            _projId = _projectService.Create(new Project { Name = "UserRoleControllerTests" }).Result!.Id;
            _userRoleController = new UserRoleController(_userRoleService, _projectService, _permissionService);
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
            _userRoleService.Create(RandomUserRole());
            _userRoleService.Create(RandomUserRole());
            _userRoleService.Create(RandomUserRole());

            var getResult = _userRoleController.Get(_projId).Result;

            Assert.IsInstanceOf<ObjectResult>(getResult);

            var roles = ((ObjectResult)getResult).Value as List<UserRole>;
            Assert.That(roles, Has.Count.EqualTo(3));
            _userRoleService.GetAllUserRoles(_projId).Result.ForEach(role => Assert.Contains(role, roles));
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
            var userRole = _userRoleService.Create(RandomUserRole()).Result;

            _userRoleService.Create(RandomUserRole());
            _userRoleService.Create(RandomUserRole());

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
            var userRole = _userRoleService.Create(RandomUserRole()).Result;
            var result = _userRoleController.Get(InvalidProjectId, userRole.Id).Result;
            Assert.IsInstanceOf<NotFoundObjectResult>(result);
        }

        [Test]
        public void TestGetUserRolesNoPermission()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var userRole = _userRoleService.Create(RandomUserRole()).Result;
            var result = _userRoleController.Get(_projId, userRole.Id).Result;
            Assert.IsInstanceOf<ForbidResult>(result);
        }

        [Test]
        public void TestCreateUserRole()
        {
            var userRole = RandomUserRole();
            var id = (string)((ObjectResult)_userRoleController.Post(_projId, userRole).Result).Value;
            userRole.Id = id;
            Assert.Contains(userRole, _userRoleService.GetAllUserRoles(_projId).Result);
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
            var userRole = _userRoleService.Create(RandomUserRole()).Result;
            var result = _userRoleController.Post(_projId, userRole).Result;
            Assert.IsInstanceOf<ForbidResult>(result);
        }

        [Test]
        public void TestUpdateUserRole()
        {
            var userRole = RandomUserRole();
            _userRoleService.Create(userRole);
            var updateRole = userRole.Clone();
            updateRole.Permissions.Add((int)Permission.WordEntry);

            _ = _userRoleController.Put(_projId, userRole.Id, updateRole).Result;

            var allUserRoles = _userRoleService.GetAllUserRoles(_projId).Result;

            Assert.Contains(updateRole, allUserRoles);
        }

        [Test]
        public void TestUpdateUserRolesMissingProject()
        {
            var userRole = RandomUserRole();
            var result = _userRoleController.Put(InvalidProjectId, userRole.Id, userRole).Result;
            Assert.IsInstanceOf<NotFoundObjectResult>(result);
        }

        [Test]
        public void TestUpdateUserRolesNoPermission()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var userRole = RandomUserRole();
            var result = _userRoleController.Put(InvalidProjectId, userRole.Id, userRole).Result;
            Assert.IsInstanceOf<ForbidResult>(result);
        }

        [Test]
        public void TestDeleteUserRole()
        {
            var origUserRole = _userRoleService.Create(RandomUserRole()).Result;

            Assert.That(_userRoleService.GetAllUserRoles(_projId).Result, Has.Count.EqualTo(1));

            _ = _userRoleController.Delete(_projId, origUserRole.Id).Result;

            Assert.That(_userRoleService.GetAllUserRoles(_projId).Result, Has.Count.EqualTo(0));
        }

        [Test]
        public void TestDeleteUserRoleNoPermission()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var userRole = _userRoleService.Create(RandomUserRole()).Result;
            var result = _userRoleController.Delete(_projId, userRole.Id).Result;
            Assert.IsInstanceOf<ForbidResult>(result);
        }

        [Test]
        public void TestDeleteAllUserRoles()
        {
            _userRoleService.Create(RandomUserRole());
            _userRoleService.Create(RandomUserRole());
            _userRoleService.Create(RandomUserRole());

            Assert.That(_userRoleService.GetAllUserRoles(_projId).Result, Has.Count.EqualTo(3));

            _ = _userRoleController.Delete(_projId).Result;

            Assert.That(_userRoleService.GetAllUserRoles(_projId).Result, Has.Count.EqualTo(0));
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
