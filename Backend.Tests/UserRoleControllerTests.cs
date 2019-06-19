using Backend.Tests;
using BackendFramework.Controllers;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Services;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using NUnit.Framework;
using System;
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

        UserRole testUserRole()
        {
            UserRole userRole = new UserRole();
            // let's add some random data
            userRole.Permission = new List<Permission>() { (Permission)1 };
            return userRole;
        }

        [Test]
        public void TestGetAllUserRoles()
        {
            _userRoleService.Create(testUserRole());
            _userRoleService.Create(testUserRole());
            _userRoleService.Create(testUserRole());

            var userRoles = (controller.Get().Result as ObjectResult).Value as List<UserRole>;
            Assert.That(userRoles, Has.Count.EqualTo(3));
            _userRoleService.GetAllUserRoles().Result.ForEach(userRole => Assert.Contains(userRole, userRoles));
        }

        [Test]
        public void TestGetUserRole()
        {
            UserRole userRole = _userRoleService.Create(testUserRole()).Result;

            _userRoleService.Create(testUserRole());
            _userRoleService.Create(testUserRole());

            var action = controller.Get(userRole.Id).Result;

            Assert.That(action, Is.InstanceOf<ObjectResult>());

            var foundUserRoles = (action as ObjectResult).Value as List<UserRole>;
            Assert.That(foundUserRoles, Has.Count.EqualTo(1));
            Assert.AreEqual(userRole, foundUserRoles[0]);
        }

        [Test]
        public void TestCreateUserRole()
        {
            UserRole userRole = testUserRole();
            string id = (controller.Post(userRole).Result as ObjectResult).Value as string;
            userRole.Id = id;
            Assert.Contains(userRole, _userRoleService.GetAllUserRoles().Result);
        }

        [Test]
        public void TestUpdateUserRole()
        {
            UserRole origUserRole = _userRoleService.Create(testUserRole()).Result;

            UserRole modUserRole = origUserRole.Clone();
            modUserRole.Permission = new List<Permission>() { (Permission)2 };

            var action = controller.Put(modUserRole.Id, modUserRole);

            Assert.That(_userRoleService.GetAllUserRoles().Result, Has.Count.EqualTo(1));
            Assert.Contains(modUserRole, _userRoleService.GetAllUserRoles().Result);
        }

        [Test]
        public void TestDeleteUserRole()
        {
            UserRole origUserRole = _userRoleService.Create(testUserRole()).Result;

            Assert.That(_userRoleService.GetAllUserRoles().Result, Has.Count.EqualTo(1));

            var action = controller.Delete(origUserRole.Id).Result;

            Assert.That(_userRoleService.GetAllUserRoles().Result, Has.Count.EqualTo(0));
        }

        [Test]
        public void TestDeleteAllUserRoles()
        {
            _userRoleService.Create(testUserRole());
            _userRoleService.Create(testUserRole());
            _userRoleService.Create(testUserRole());

            Assert.That(_userRoleService.GetAllUserRoles().Result, Has.Count.EqualTo(3));

            var action = controller.Delete().Result;

            Assert.That(_userRoleService.GetAllUserRoles().Result, Has.Count.EqualTo(0));
        }
    }
}