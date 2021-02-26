using System;
using System.Collections.Generic;
using Backend.Tests.Mocks;
using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;

namespace Backend.Tests.Controllers
{
    public class UserEditControllerTests
    {
        private IUserEditRepository _userEditRepo = null!;
        private IUserEditService _userEditService = null!;
        private UserEditController _userEditController = null!;

        private IProjectService _projectService = null!;
        private string _projId = null!;
        private IPermissionService _permissionService = null!;
        private IUserService _userService = null!;
        private User _jwtAuthenticatedUser = null!;

        [SetUp]
        public void Setup()
        {
            _permissionService = new PermissionServiceMock();
            _userEditRepo = new UserEditRepositoryMock();
            _userEditService = new UserEditService(_userEditRepo);
            _projectService = new ProjectServiceMock();
            _projId = _projectService.Create(new Project { Name = "UserEditControllerTests" }).Result!.Id;
            _userService = new UserServiceMock();
            _userEditController = new UserEditController(_userEditRepo, _userEditService, _projectService,
                _permissionService, _userService)
            {
                ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
            };
            _jwtAuthenticatedUser = new User { Username = "user", Password = "pass" };
            _userService.Create(_jwtAuthenticatedUser);
            _jwtAuthenticatedUser = _userService.Authenticate(
                _jwtAuthenticatedUser.Username, _jwtAuthenticatedUser.Password).Result ?? throw new Exception();
            _userEditController.ControllerContext.HttpContext.Request.Headers["UserId"] = _jwtAuthenticatedUser.Id;
        }

        private UserEdit RandomUserEdit()
        {
            var rnd = new Random();
            var count = rnd.Next(0, 7);

            var userEdit = new UserEdit();
            var edit = new Edit
            {
                GoalType = count,
                StepData = new List<string> { Util.RandString() }
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

            var edits = ((ObjectResult)getResult).Value as List<UserEdit>;
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
            Assert.IsInstanceOf<ObjectResult>(action);

            var foundUserEdit = ((ObjectResult)action).Value as UserEdit;
            Assert.AreEqual(userEdit, foundUserEdit);
        }

        [Test]
        public void TestCreateUserEdit()
        {
            var userEdit = new UserEdit { ProjectId = _projId };
            var withUser = (WithUser)((ObjectResult)_userEditController.Post(_projId).Result).Value;
            userEdit.Id = withUser.UpdatedUser.WorkedProjects[_projId];
            Assert.Contains(userEdit, _userEditRepo.GetAllUserEdits(_projId).Result);
        }

        [Test]
        public void TestAddGoalToUserEdit()
        {
            var userEdit = RandomUserEdit();
            _userEditRepo.Create(userEdit);
            var newEdit = new Edit();
            newEdit.StepData.Add("This is a new step");
            var updatedUserEdit = userEdit.Clone();
            updatedUserEdit.Edits.Add(newEdit);

            _ = _userEditController.Post(_projId, userEdit.Id, newEdit).Result;

            var allUserEdits = _userEditRepo.GetAllUserEdits(_projId).Result;
            Assert.Contains(updatedUserEdit, allUserEdits);
        }

        [Test]
        public void TestAddStepToGoal()
        {
            // Generate db entry to test.
            var rnd = new Random();
            var count = rnd.Next(1, 13);

            for (var i = 0; i < count; i++)
            {
                _ = _userEditRepo.Create(RandomUserEdit()).Result;
            }
            var origUserEdit = _userEditRepo.Create(RandomUserEdit()).Result;

            // Generate correct result for comparison.
            var modUserEdit = origUserEdit.Clone();
            const string stringStep = "This is another step added.";
            const int modGoalIndex = 0;
            modUserEdit.Edits[modGoalIndex].StepData.Add(stringStep);

            // Create and put wrapper object.
            var stepWrapperObj = new UserEditStepWrapper(modGoalIndex, stringStep);
            _ = _userEditController.Put(_projId, origUserEdit.Id, stepWrapperObj);

            // Step count should have increased by 1.
            Assert.That(_userEditRepo.GetAllUserEdits(_projId).Result, Has.Count.EqualTo(count + 1));

            var userEdit = _userEditRepo.GetUserEdit(_projId, origUserEdit.Id).Result;
            if (userEdit is null)
            {
                Assert.Fail();
                return;
            }
            Assert.Contains(stringStep, userEdit.Edits[modGoalIndex].StepData);

            // Now update a step within the goal.
            const string modStringStep = "This is a replacement step.";
            const int modStepIndex = 1;
            modUserEdit.Edits[modGoalIndex].StepData[modStepIndex] = modStringStep;

            // Create and put wrapper object.
            stepWrapperObj = new UserEditStepWrapper(modGoalIndex, modStringStep, modStepIndex);
            _ = _userEditController.Put(_projId, origUserEdit.Id, stepWrapperObj);

            // Step count should not have further increased.
            Assert.That(_userEditRepo.GetAllUserEdits(_projId).Result, Has.Count.EqualTo(count + 1));

            userEdit = _userEditRepo.GetUserEdit(_projId, origUserEdit.Id).Result;
            if (userEdit is null)
            {
                Assert.Fail();
                return;
            }
            Assert.Contains(modStringStep, userEdit.Edits[modGoalIndex].StepData);
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

        [Test]
        public void TestGetMissingUserEdit()
        {
            var action = _userEditController.Get(_projId, "INVALID_USER_EDIT_ID").Result;
            Assert.IsInstanceOf<NotFoundObjectResult>(action);
        }
    }
}
