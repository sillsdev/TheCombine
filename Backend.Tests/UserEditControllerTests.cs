﻿using System;
using System.Collections.Generic;
using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;

namespace Backend.Tests
{
    public class UserEditControllerTests
    {
        private IUserEditRepository _userEditRepo;
        private IUserEditService _userEditService;
        private UserEditController _userEditController;

        private IProjectService _projectService;
        private string _projId;
        private IPermissionService _permissionService;
        private IUserService _userService;

        [SetUp]
        public void Setup()
        {
            _permissionService = new PermissionServiceMock();
            _userEditRepo = new UserEditRepositoryMock();
            _userEditService = new UserEditService(_userEditRepo);
            _projectService = new ProjectServiceMock();
            _projId = _projectService.Create(new Project()).Result.Id;
            _userService = new UserServiceMock();
            _userEditController = new UserEditController(_userEditRepo, _userEditService, _projectService,
                _permissionService, _userService)
            {
                ControllerContext = new ControllerContext {HttpContext = new DefaultHttpContext()}
            };

        }

        private UserEdit RandomUserEdit()
        {
            var rnd = new Random();
            var count = rnd.Next(0, 7);

            var userEdit = new UserEdit();
            var edit = new Edit
            {
                GoalType = count,
                StepData = new List<string>() { Util.RandString() }
            };
            userEdit.ProjectId = _projId;
            userEdit.Edits.Add(edit);
            return userEdit;
        }

        [Test]
        public void TestGetAllUserEdits()
        {
            _userEditRepo.Create(RandomUserEdit());
            _userEditRepo.Create(RandomUserEdit());
            _userEditRepo.Create(RandomUserEdit());

            var getResult = _userEditController.Get(_projId).Result;
            Assert.IsInstanceOf<ObjectResult>(getResult);

            var edits = (getResult as ObjectResult).Value as List<UserEdit>;
            Assert.That(edits, Has.Count.EqualTo(3));
            _userEditRepo.GetAllUserEdits(_projId).Result.ForEach(edit => Assert.Contains(edit, edits));
        }

        [Test]
        public void TestGetUserEdit()
        {
            var userEdit = _userEditRepo.Create(RandomUserEdit()).Result;

            _userEditRepo.Create(RandomUserEdit());
            _userEditRepo.Create(RandomUserEdit());

            var action = _userEditController.Get(_projId, userEdit.Id).Result;
            Assert.That(action, Is.InstanceOf<ObjectResult>());

            var foundUserEdit = (action as ObjectResult).Value as UserEdit;
            Assert.AreEqual(userEdit, foundUserEdit);
        }

        [Test]
        public void TestCreateUserEdit()
        {
            var userEdit = new UserEdit {ProjectId = _projId};
            var id = (_userEditController.Post(_projId).Result as ObjectResult).Value as string;
            userEdit.Id = id;
            Assert.Contains(userEdit, _userEditRepo.GetAllUserEdits(_projId).Result);
        }

        [Test]
        public void TestAddEditsToGoal()
        {
            var userEdit = RandomUserEdit();
            _userEditRepo.Create(userEdit);
            var newEditStep = new Edit();
            newEditStep.StepData.Add("This is a new step");
            var updateEdit = userEdit.Clone();
            updateEdit.Edits.Add(newEditStep);

            _ = _userEditController.Post(_projId, userEdit.Id, newEditStep).Result;

            var allUserEdits = _userEditRepo.GetAllUserEdits(_projId).Result;
            Assert.Contains(updateEdit, allUserEdits);
        }

        [Test]
        public void TestGoalToUserEdit()
        {
            // Generate db entry to test
            var rnd = new Random();
            var count = rnd.Next(1, 13);

            for (var i = 0; i < count; i++)
            {
                _ = _userEditRepo.Create(RandomUserEdit()).Result;
            }
            var origUserEdit = _userEditRepo.Create(RandomUserEdit()).Result;

            // Generate correct result for comparison
            var modUserEdit = origUserEdit.Clone();
            const string stringUserEdit = "This is another step added";
            modUserEdit.Edits[0].StepData.Add(stringUserEdit);

            // Create wrapper object
            const int modGoalIndex = 0;
            var wrapperObj = new UserEditObjectWrapper(modGoalIndex, stringUserEdit);

            var action = _userEditController.Put(_projId, origUserEdit.Id, wrapperObj);

            Assert.That(_userEditRepo.GetAllUserEdits(_projId).Result, Has.Count.EqualTo(count + 1));
            Assert.Contains(stringUserEdit, _userEditRepo.GetUserEdit(
                _projId, origUserEdit.Id).Result.Edits[modGoalIndex].StepData);
        }

        [Test]
        public void TestDeleteUserEdit()
        {
            var origUserEdit = _userEditRepo.Create(RandomUserEdit()).Result;

            Assert.That(_userEditRepo.GetAllUserEdits(_projId).Result, Has.Count.EqualTo(1));

            _ = _userEditController.Delete(_projId, origUserEdit.Id).Result;

            Assert.That(_userEditRepo.GetAllUserEdits(_projId).Result, Has.Count.EqualTo(0));
        }

        [Test]
        public void TestDeleteAllUserEdits()
        {
            _userEditRepo.Create(RandomUserEdit());
            _userEditRepo.Create(RandomUserEdit());
            _userEditRepo.Create(RandomUserEdit());

            Assert.That(_userEditRepo.GetAllUserEdits(_projId).Result, Has.Count.EqualTo(3));

            _ = _userEditController.Delete(_projId).Result;

            Assert.That(_userEditRepo.GetAllUserEdits(_projId).Result, Has.Count.EqualTo(0));
        }
    }
}
