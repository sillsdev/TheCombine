using System.Collections.Generic;
using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;

namespace Backend.Tests
{
    public class UserRoleControllerTests
    {
        private IUserRoleService _userRoleService;
        private UserRoleController _userRoleController;

        private IProjectService _projectService;
        private string _projId;
        private IPermissionService _permissionService;

        [SetUp]
        public void Setup()
        {
            _permissionService = new PermissionServiceMock();
            _userRoleService = new UserRoleServiceMock();
            _projectService = new ProjectServiceMock();
            _projId = _projectService.Create(new Project()).Result.Id;
            _userRoleController = new UserRoleController(_userRoleService, _projectService, _permissionService);
        }

        private UserRole RandomUserRole()
        {
            var userRole = new UserRole
            {
                ProjectId = _projId,
                Permissions = new List<int>()
                {
                    (int)Permission.EditSettingsAndUsers, (int)Permission.ImportExport, (int)Permission.MergeAndCharSet
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

            var roles = (getResult as ObjectResult).Value as List<UserRole>;
            Assert.That(roles, Has.Count.EqualTo(3));
            _userRoleService.GetAllUserRoles(_projId).Result.ForEach(Role => Assert.Contains(Role, roles));
        }

        [Test]
        public void TestGetUserRole()
        {
            var userRole = _userRoleService.Create(RandomUserRole()).Result;

            _userRoleService.Create(RandomUserRole());
            _userRoleService.Create(RandomUserRole());

            var action = _userRoleController.Get(_projId, userRole.Id).Result;

            Assert.That(action, Is.InstanceOf<ObjectResult>());

            var foundUserRole = (action as ObjectResult).Value as UserRole;
            Assert.AreEqual(userRole, foundUserRole);
        }

        [Test]
        public void TestCreateUserRole()
        {
            var userRole = RandomUserRole();
            var id = (_userRoleController.Post(_projId, userRole).Result as ObjectResult).Value as string;
            userRole.Id = id;
            Assert.Contains(userRole, _userRoleService.GetAllUserRoles(_projId).Result);
        }

        [Test]
        public void TestUpdateUserRole()
        {
            var userRole = RandomUserRole();
            _userRoleService.Create(userRole);
            var updateRole = userRole.Clone();
            updateRole.Permissions.Add((int)Permission.WordEntry);

            _ = _userRoleController.Put(_projId ,userRole.Id, updateRole).Result;

            var allUserRoles = _userRoleService.GetAllUserRoles(_projId).Result;

            Assert.Contains(updateRole, allUserRoles);
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
        public void TestDeleteAllUserRoles()
        {
            _userRoleService.Create(RandomUserRole());
            _userRoleService.Create(RandomUserRole());
            _userRoleService.Create(RandomUserRole());

            Assert.That(_userRoleService.GetAllUserRoles(_projId).Result, Has.Count.EqualTo(3));

            _ = _userRoleController.Delete(_projId).Result;

            Assert.That(_userRoleService.GetAllUserRoles(_projId).Result, Has.Count.EqualTo(0));
        }
    }
}
