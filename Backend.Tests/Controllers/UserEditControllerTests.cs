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
using static System.Linq.Enumerable;

namespace Backend.Tests.Controllers
{
    public class UserEditControllerTests
    {
        private IProjectRepository _projRepo = null!;
        private IUserRepository _userRepo = null!;
        private IUserEditRepository _userEditRepo = null!;
        private IPermissionService _permissionService = null!;
        private IUserEditService _userEditService = null!;
        private UserEditController _userEditController = null!;

        private User _jwtAuthenticatedUser = null!;
        private string _projId = null!;

        [SetUp]
        public void Setup()
        {
            _projRepo = new ProjectRepositoryMock();
            _userRepo = new UserRepositoryMock();
            _userEditRepo = new UserEditRepositoryMock();
            _permissionService = new PermissionServiceMock(_userRepo);
            _userEditService = new UserEditService(_userEditRepo);
            _userEditController = new UserEditController(
                _userEditRepo, _userEditService, _projRepo, _permissionService, _userRepo)
            {
                ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
            };

            _jwtAuthenticatedUser = new User { Username = "user", Password = "pass" };
            _userRepo.Create(_jwtAuthenticatedUser);
            _jwtAuthenticatedUser = _permissionService.Authenticate(
                _jwtAuthenticatedUser.Username, _jwtAuthenticatedUser.Password).Result ?? throw new Exception();
            _userEditController.ControllerContext.HttpContext.Request.Headers["UserId"] = _jwtAuthenticatedUser.Id;
            _projId = _projRepo.Create(new Project { Name = "UserEditControllerTests" }).Result!.Id;
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

            var getResult = _userEditController.GetProjectUserEdits(_projId).Result;
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

            var action = _userEditController.GetUserEdit(_projId, userEdit.Id).Result;
            Assert.IsInstanceOf<ObjectResult>(action);

            var foundUserEdit = ((ObjectResult)action).Value as UserEdit;
            Assert.AreEqual(userEdit, foundUserEdit);
        }

        [Test]
        public void TestCreateUserEdit()
        {
            var userEdit = new UserEdit { ProjectId = _projId };
            var updatedUser = (User)((ObjectResult)_userEditController.CreateUserEdit(_projId).Result).Value;
            userEdit.Id = updatedUser.WorkedProjects[_projId];
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

            _ = _userEditController.UpdateUserEditGoal(_projId, userEdit.Id, newEdit).Result;

            var allUserEdits = _userEditRepo.GetAllUserEdits(_projId).Result;
            Assert.Contains(updatedUserEdit, allUserEdits);
        }

        [Test]
        public void TestAddStepToGoal()
        {
            // Generate db entry to test.
            var rnd = new Random();
            var count = rnd.Next(1, 13);

            foreach (var i in Range(0, count))
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
            _ = _userEditController.UpdateUserEditStep(_projId, origUserEdit.Id, stepWrapperObj);

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
            _ = _userEditController.UpdateUserEditStep(_projId, origUserEdit.Id, stepWrapperObj);

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

            _ = _userEditController.DeleteUserEdit(_projId, origUserEdit.Id).Result;

            Assert.That(_userEditRepo.GetAllUserEdits(_projId).Result, Has.Count.EqualTo(0));
        }

        [Test]
        public void TestGetMissingUserEdit()
        {
            var action = _userEditController.GetUserEdit(_projId, "INVALID_USER_EDIT_ID").Result;
            Assert.IsInstanceOf<NotFoundObjectResult>(action);
        }
    }
}
