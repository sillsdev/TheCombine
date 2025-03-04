using System;
using System.Collections.Generic;
using System.Threading.Tasks;
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
    public class UserEditControllerTests : IDisposable
    {
        private IProjectRepository _projRepo = null!;
        private IUserRepository _userRepo = null!;
        private IUserEditRepository _userEditRepo = null!;
        private IPermissionService _permissionService = null!;
        private IUserEditService _userEditService = null!;
        private UserEditController _userEditController = null!;

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (disposing)
            {
                _userEditController?.Dispose();
            }
        }

        private User _jwtAuthenticatedUser = null!;
        private string _projId = null!;
        private const string MissingId = "MISSING_ID";

        [SetUp]
        public async Task Setup()
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
            await _userRepo.Create(_jwtAuthenticatedUser);
            _jwtAuthenticatedUser = await _permissionService.Authenticate(_jwtAuthenticatedUser.Username,
                _jwtAuthenticatedUser.Password) ?? throw new UserAuthenticationException();
            _userEditController.ControllerContext.HttpContext.Request.Headers["UserId"] = _jwtAuthenticatedUser.Id;
            _projId = (await _projRepo.Create(new Project { Name = "UserEditControllerTests" }))!.Id;
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
        public async Task TestGetAllUserEdits()
        {
            await _userEditRepo.Create(RandomUserEdit());
            await _userEditRepo.Create(RandomUserEdit());
            await _userEditRepo.Create(RandomUserEdit());

            var getResult = await _userEditController.GetProjectUserEdits(_projId);
            Assert.That(getResult, Is.InstanceOf<ObjectResult>());

            var edits = ((ObjectResult)getResult).Value as List<UserEdit>;
            Assert.That(edits, Has.Count.EqualTo(3));
            var repoEdits = await _userEditRepo.GetAllUserEdits(_projId);
            repoEdits.ForEach(edit => Assert.That(edits, Does.Contain(edit).UsingPropertiesComparer()));
        }

        [Test]
        public async Task TestGetAllUserEditsNoPermission()
        {
            _userEditController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            await _userEditRepo.Create(RandomUserEdit());
            var result = await _userEditController.GetProjectUserEdits(_projId);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestGetAllUserEditsMissingProject()
        {
            var result = await _userEditController.GetProjectUserEdits(MissingId);
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task TestGetUserEdit()
        {
            var userEdit = await _userEditRepo.Create(RandomUserEdit());

            await _userEditRepo.Create(RandomUserEdit());
            await _userEditRepo.Create(RandomUserEdit());

            var result = await _userEditController.GetUserEdit(_projId, userEdit.Id);
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            Assert.That(((ObjectResult)result).Value, Is.EqualTo(userEdit).UsingPropertiesComparer());
        }

        [Test]
        public async Task TestGetUserEditNoPermission()
        {
            _userEditController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            var userEdit = await _userEditRepo.Create(RandomUserEdit());
            var result = await _userEditController.GetUserEdit(_projId, userEdit.Id);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestGetUserEditMissingProjectId()
        {
            var userEdit = await _userEditRepo.Create(RandomUserEdit());
            var result = await _userEditController.GetUserEdit(MissingId, userEdit.Id);
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task TestGetMissingUserEdit()
        {
            var result = await _userEditController.GetUserEdit(_projId, MissingId);
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task TestCreateUserEdit()
        {
            var userEdit = new UserEdit { ProjectId = _projId };
            var updatedUser = (User)((ObjectResult)await _userEditController.CreateUserEdit(_projId)).Value!;
            userEdit.Id = updatedUser.WorkedProjects[_projId];
            var userEdits = await _userEditRepo.GetAllUserEdits(_projId);
            Assert.That(userEdits, Does.Contain(userEdit).UsingPropertiesComparer());
        }

        [Test]
        public async Task TestCreateUserEditNoPermission()
        {
            _userEditController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = await _userEditController.CreateUserEdit(_projId);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestAddGoalToUserEdit()
        {
            var userEdit = RandomUserEdit();
            await _userEditRepo.Create(userEdit);
            var newEdit = new Edit();
            newEdit.StepData.Add("This is a new step");
            var updatedUserEdit = userEdit.Clone();
            updatedUserEdit.Edits.Add(newEdit);

            await _userEditController.UpdateUserEditGoal(_projId, userEdit.Id, newEdit);

            var allUserEdits = await _userEditRepo.GetAllUserEdits(_projId);
            Assert.That(allUserEdits, Does.Contain(updatedUserEdit).UsingPropertiesComparer());
        }

        [Test]
        public async Task TestAddGoalToUserEditNoPermissions()
        {
            _userEditController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            var userEdit = RandomUserEdit();
            await _userEditRepo.Create(userEdit);
            var result = await _userEditController.UpdateUserEditGoal(_projId, userEdit.Id, new Edit());
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestAddGoalToUserEditMissingIds()
        {
            var newEdit = new Edit();

            var userEdit = await _userEditRepo.Create(RandomUserEdit());
            var noProjResult = await _userEditController.UpdateUserEditGoal(MissingId, userEdit.Id, newEdit);
            Assert.That(noProjResult, Is.InstanceOf<NotFoundObjectResult>());

            var noEditResult = await _userEditController.UpdateUserEditGoal(_projId, MissingId, newEdit);
            Assert.That(noEditResult, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task TestAddStepToGoal()
        {
            // Generate db entry to test.
            var rnd = new Random();
            var count = rnd.Next(1, 13);

            foreach (var _ in Range(0, count))
            {
                await _userEditRepo.Create(RandomUserEdit());
            }
            var origUserEdit = await _userEditRepo.Create(RandomUserEdit());
            var firstEditGuid = origUserEdit.Edits.First().Guid;

            // Generate correct result for comparison.
            const string stringStep = "This is another step added.";

            // Create and put wrapper object.
            var stepWrapperObj = new UserEditStepWrapper(firstEditGuid, stringStep);
            await _userEditController.UpdateUserEditStep(_projId, origUserEdit.Id, stepWrapperObj);

            // Step count should have increased by 1.
            Assert.That(await _userEditRepo.GetAllUserEdits(_projId), Has.Count.EqualTo(count + 1));

            var userEdit = await _userEditRepo.GetUserEdit(_projId, origUserEdit.Id);
            Assert.That(userEdit, Is.Not.Null);
            Assert.That(userEdit!.Edits.First().StepData, Does.Contain(stringStep));

            // Now update a step within the goal.
            const string modStringStep = "This is a replacement step.";
            const int modStepIndex = 1;

            // Create and put wrapper object.
            stepWrapperObj = new UserEditStepWrapper(firstEditGuid, modStringStep, modStepIndex);
            await _userEditController.UpdateUserEditStep(_projId, origUserEdit.Id, stepWrapperObj);

            // Step count should not have further increased.
            Assert.That(await _userEditRepo.GetAllUserEdits(_projId), Has.Count.EqualTo(count + 1));

            userEdit = await _userEditRepo.GetUserEdit(_projId, origUserEdit.Id);
            Assert.That(userEdit, Is.Not.Null);
            Assert.That(userEdit!.Edits.First().StepData, Does.Contain(modStringStep));
        }

        [Test]
        public async Task TestUpdateUserEditStepNoPermissions()
        {
            _userEditController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var userEdit = await _userEditRepo.Create(RandomUserEdit());
            var stepWrapper = new UserEditStepWrapper(userEdit.Edits.First().Guid, "A new step");
            var result = await _userEditController.UpdateUserEditStep(_projId, userEdit.Id, stepWrapper);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestUpdateUserEditStepMissingIds()
        {

            var userEdit = await _userEditRepo.Create(RandomUserEdit());
            var stepWrapper = new UserEditStepWrapper(userEdit.Edits.First().Guid, "step");

            var noProjResult = await _userEditController.UpdateUserEditStep(MissingId, userEdit.Id, stepWrapper);
            Assert.That(noProjResult, Is.InstanceOf<NotFoundObjectResult>());

            var noUserEditResult = await _userEditController.UpdateUserEditStep(_projId, MissingId, stepWrapper);
            Assert.That(noUserEditResult, Is.InstanceOf<NotFoundObjectResult>());

            var diffGuidWrapper = new UserEditStepWrapper(Guid.NewGuid(), "step");
            var noEditResult = await _userEditController.UpdateUserEditStep(_projId, userEdit.Id, diffGuidWrapper);
            Assert.That(noEditResult, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task TestDeleteUserEdit()
        {
            var origUserEdit = await _userEditRepo.Create(RandomUserEdit());
            Assert.That(await _userEditRepo.GetAllUserEdits(_projId), Has.Count.EqualTo(1));

            await _userEditController.DeleteUserEdit(_projId, origUserEdit.Id);
            Assert.That(await _userEditRepo.GetAllUserEdits(_projId), Is.Empty);
        }

        [Test]
        public async Task TestDeleteUserEditMissingPermissions()
        {
            _userEditController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var userEdit = await _userEditRepo.Create(RandomUserEdit());
            var result = await _userEditController.DeleteUserEdit(_projId, userEdit.Id);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestDeleteUserEditMissingIds()
        {
            var userEdit = await _userEditRepo.Create(RandomUserEdit());
            var noProjResult = await _userEditController.DeleteUserEdit(MissingId, userEdit.Id);
            Assert.That(noProjResult, Is.InstanceOf<NotFoundObjectResult>());

            var noEditResult = await _userEditController.DeleteUserEdit(_projId, MissingId);
            Assert.That(noEditResult, Is.InstanceOf<NotFoundObjectResult>());
        }
    }
}
