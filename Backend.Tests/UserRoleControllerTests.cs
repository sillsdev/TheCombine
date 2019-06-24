using Backend.Tests;
using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;
using System.Collections.Generic;

namespace Tests
{
    public class UserRoleControllerTests
    {
        IUserRoleService _userRoleService;
        UserRoleController controller;

        [SetUp]
        public void Setup()
        {
            _userRoleService = new UserRoleServiceMock();
            controller = new UserRoleController(_userRoleService);
        }

        UserRole RandomUserRole()
        {
            UserRole userRole = new UserRole();
            userRole.Permissions = new List<Permission>() { Permission.permission1 };
            return userRole;
        }

        [Test]
        public void TestGetAllUserRoles()
        {
            _userRoleService.Create(RandomUserRole());
            _userRoleService.Create(RandomUserRole());
            _userRoleService.Create(RandomUserRole());

            var userRoles = (controller.Get().Result as ObjectResult).Value as List<UserRole>;
            Assert.That(userRoles, Has.Count.EqualTo(3));
            _userRoleService.GetAllUserRoles().Result.ForEach(userRole => Assert.Contains(userRole, userRoles));
        }

        [Test]
        public void TestGetUserRole()
        {
            UserRole userRole = _userRoleService.Create(RandomUserRole()).Result;

            _userRoleService.Create(RandomUserRole());
            _userRoleService.Create(RandomUserRole());

            var action = controller.Get(userRole.Id).Result;

            Assert.That(action, Is.InstanceOf<ObjectResult>());

            var foundUserRole = (action as ObjectResult).Value as UserRole;
            Assert.AreEqual(userRole, foundUserRole);
        }

        [Test]
        public void TestCreateUserRole()
        {
            UserRole userRole = RandomUserRole();
            string id = (controller.Post(userRole).Result as ObjectResult).Value as string;
            userRole.Id = id;
            Assert.Contains(userRole, _userRoleService.GetAllUserRoles().Result);
        }

        [Test]
        public void TestUpdateUserRole()
        {
            UserRole origUserRole = _userRoleService.Create(RandomUserRole()).Result;

            UserRole modUserRole = origUserRole.Clone();
            modUserRole.Permissions = new List<Permission>() { Permission.permission2 };

            var action = controller.Put(modUserRole.Id, modUserRole);

            Assert.That(_userRoleService.GetAllUserRoles().Result, Has.Count.EqualTo(1));
            Assert.Contains(modUserRole, _userRoleService.GetAllUserRoles().Result);
        }

        [Test]
        public void TestDeleteUserRole()
        {
            UserRole origUserRole = _userRoleService.Create(RandomUserRole()).Result;

            Assert.That(_userRoleService.GetAllUserRoles().Result, Has.Count.EqualTo(1));

            _ = controller.Delete(origUserRole.Id).Result;

            Assert.That(_userRoleService.GetAllUserRoles().Result, Has.Count.EqualTo(0));
        }

        [Test]
        public void TestDeleteAllUserRoles()
        {
            _userRoleService.Create(RandomUserRole());
            _userRoleService.Create(RandomUserRole());
            _userRoleService.Create(RandomUserRole());

            Assert.That(_userRoleService.GetAllUserRoles().Result, Has.Count.EqualTo(3));

            _ = controller.Delete().Result;

            Assert.That(_userRoleService.GetAllUserRoles().Result, Has.Count.EqualTo(0));
        }
    }
}