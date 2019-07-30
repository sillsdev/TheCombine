﻿using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using BackendFramework.Services;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;
using System;
using System.Collections.Generic;

namespace Backend.Tests
{
    [Parallelizable(ParallelScope.Self)]
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

        UserRole RandomUserRole()
        {
            UserRole userRole = new UserRole
            {
                ProjectId = _projId,
                Permissions = new List<int>() { (int)Permission.EditSettingsNUsers, (int)Permission.ImportExport, (int)Permission.MergeNCharSet }
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

            var Roles = (getResult as ObjectResult).Value as List<UserRole>;
            Assert.That(Roles, Has.Count.EqualTo(3));
            _userRoleService.GetAllUserRoles(_projId).Result.ForEach(Role => Assert.Contains(Role, Roles));
        }

        [Test]
        public void TestGetUserRole()
        {
            UserRole userRole = _userRoleService.Create(RandomUserRole()).Result;

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
            UserRole userRole = RandomUserRole();
            string id = (_userRoleController.Post(_projId, userRole).Result as ObjectResult).Value as string;
            userRole.Id = id;
            Assert.Contains(userRole, _userRoleService.GetAllUserRoles(_projId).Result);
        }

        [Test]
        public void TestUpdateUserRole()
        {
            UserRole userRole = RandomUserRole();
            _userRoleService.Create(userRole);
            UserRole updateRole = userRole.Clone();
            updateRole.Permissions.Add((int)Permission.WordEntry);

            _ = _userRoleController.Put(_projId ,userRole.Id, updateRole).Result;

            var allUserRoles = _userRoleService.GetAllUserRoles(_projId).Result;

            Assert.Contains(updateRole, allUserRoles);
        }

        [Test]
        public void TestDeleteUserRole()
        {
            UserRole origUserRole = _userRoleService.Create(RandomUserRole()).Result;

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