using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Tests.Mocks;
using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Services;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;
using static System.Linq.Enumerable;

namespace Backend.Tests.Controllers
{
    internal sealed class UserEditControllerTests : IDisposable
    {
        private IUserRepository _userRepo = null!;
        private IUserEditRepository _userEditRepo = null!;
        private UserEditController _userEditController = null!;

        public void Dispose()
        {
            _userEditController?.Dispose();
            GC.SuppressFinalize(this);
        }

        private const string ProjId = "PROJECT_ID";
        private const string MissingId = "MISSING_ID";

        [SetUp]
        public void Setup()
        {
            _userRepo = new UserRepositoryMock();
            _userEditRepo = new UserEditRepositoryMock();
            _userEditController = new UserEditController(
                _userEditRepo, new UserEditService(_userEditRepo), new PermissionServiceMock(_userRepo), _userRepo);

            var _userId = _userRepo.Create(new() { Username = "user", Password = "pass" }).Result!.Id;
            _userEditController.ControllerContext.HttpContext = PermissionServiceMock.HttpContextWithUserId(_userId);
        }

        private static UserEdit RandomUserEdit()
        {
            var rnd = new Random();

            var userEdit = new UserEdit
            {
                ProjectId = ProjId,
            };
            var edit = new Edit
            {
                GoalType = rnd.Next(0, 7),
                StepData = [Util.RandString()]
            };
            userEdit.Edits.Add(edit);
            return userEdit;
        }

        [Test]
        public async Task TestGetAllUserEdits()
        {
            await _userEditRepo.Create(RandomUserEdit());
            await _userEditRepo.Create(RandomUserEdit());
            await _userEditRepo.Create(RandomUserEdit());

            var getResult = await _userEditController.GetProjectUserEdits(ProjId);
            Assert.That(getResult, Is.InstanceOf<ObjectResult>());

            var edits = ((ObjectResult)getResult).Value as List<UserEdit>;
            Assert.That(edits, Has.Count.EqualTo(3));
            var repoEdits = await _userEditRepo.GetAllUserEdits(ProjId);
            repoEdits.ForEach(edit => Assert.That(edits, Does.Contain(edit).UsingPropertiesComparer()));
        }

        [Test]
        public async Task TestGetAllUserEditsNoPermission()
        {
            _userEditController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            await _userEditRepo.Create(RandomUserEdit());
            var result = await _userEditController.GetProjectUserEdits(ProjId);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestGetUserEdit()
        {
            var userEdit = await _userEditRepo.Create(RandomUserEdit());

            await _userEditRepo.Create(RandomUserEdit());
            await _userEditRepo.Create(RandomUserEdit());

            var result = await _userEditController.GetUserEdit(ProjId, userEdit.Id);
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            Assert.That(((ObjectResult)result).Value, Is.EqualTo(userEdit).UsingPropertiesComparer());
        }

        [Test]
        public async Task TestGetUserEditNoPermission()
        {
            _userEditController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            var userEdit = await _userEditRepo.Create(RandomUserEdit());
            var result = await _userEditController.GetUserEdit(ProjId, userEdit.Id);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestGetMissingUserEdit()
        {
            var result = await _userEditController.GetUserEdit(ProjId, MissingId);
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task TestCreateUserEdit()
        {
            var userEdit = new UserEdit { ProjectId = ProjId };
            var updatedUser = (User)((ObjectResult)await _userEditController.CreateUserEdit(ProjId)).Value!;
            userEdit.Id = updatedUser.WorkedProjects[ProjId];
            var repoEdits = await _userEditRepo.GetAllUserEdits(ProjId);
            Assert.That(repoEdits, Does.Contain(userEdit).UsingPropertiesComparer());
        }

        [Test]
        public async Task TestCreateUserEditNoPermission()
        {
            _userEditController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = await _userEditController.CreateUserEdit(ProjId);
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

            await _userEditController.UpdateUserEditGoal(ProjId, userEdit.Id, newEdit);

            var repoUserEdit = await _userEditRepo.GetUserEdit(ProjId, userEdit.Id);
            newEdit.Modified = repoUserEdit!.Edits.FirstOrDefault(e => e.Guid == newEdit.Guid)!.Modified;
            Assert.That(repoUserEdit, Is.EqualTo(updatedUserEdit).UsingPropertiesComparer());
        }

        [Test]
        public async Task TestAddGoalToUserEditNoPermissions()
        {
            _userEditController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            var userEdit = RandomUserEdit();
            await _userEditRepo.Create(userEdit);
            var result = await _userEditController.UpdateUserEditGoal(ProjId, userEdit.Id, new Edit());
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestAddGoalToUserEditMissingUserEdit()
        {
            var noEditResult = await _userEditController.UpdateUserEditGoal(ProjId, MissingId, new Edit());
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
            await _userEditController.UpdateUserEditStep(ProjId, origUserEdit.Id, stepWrapperObj);

            // Step count should have increased by 1.
            Assert.That(await _userEditRepo.GetAllUserEdits(ProjId), Has.Count.EqualTo(count + 1));

            var userEdit = await _userEditRepo.GetUserEdit(ProjId, origUserEdit.Id);
            Assert.That(userEdit, Is.Not.Null);
            Assert.That(userEdit!.Edits.First().StepData, Does.Contain(stringStep));

            // Now update a step within the goal.
            const string modStringStep = "This is a replacement step.";
            const int modStepIndex = 1;

            // Create and put wrapper object.
            stepWrapperObj = new UserEditStepWrapper(firstEditGuid, modStringStep, modStepIndex);
            await _userEditController.UpdateUserEditStep(ProjId, origUserEdit.Id, stepWrapperObj);

            // Step count should not have further increased.
            Assert.That(await _userEditRepo.GetAllUserEdits(ProjId), Has.Count.EqualTo(count + 1));

            userEdit = await _userEditRepo.GetUserEdit(ProjId, origUserEdit.Id);
            Assert.That(userEdit, Is.Not.Null);
            Assert.That(userEdit!.Edits.First().StepData, Does.Contain(modStringStep));
        }

        [Test]
        public async Task TestUpdateUserEditStepNoPermissions()
        {
            _userEditController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var userEdit = await _userEditRepo.Create(RandomUserEdit());
            var stepWrapper = new UserEditStepWrapper(userEdit.Edits.First().Guid, "A new step");
            var result = await _userEditController.UpdateUserEditStep(ProjId, userEdit.Id, stepWrapper);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestUpdateUserEditStepMissingIds()
        {

            var userEdit = await _userEditRepo.Create(RandomUserEdit());
            var stepWrapper = new UserEditStepWrapper(userEdit.Edits.First().Guid, "step");

            var noUserEditResult = await _userEditController.UpdateUserEditStep(ProjId, MissingId, stepWrapper);
            Assert.That(noUserEditResult, Is.InstanceOf<NotFoundObjectResult>());

            var diffGuidWrapper = new UserEditStepWrapper(Guid.NewGuid(), "step");
            var noEditResult = await _userEditController.UpdateUserEditStep(ProjId, userEdit.Id, diffGuidWrapper);
            Assert.That(noEditResult, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task TestDeleteUserEdit()
        {
            var origUserEdit = await _userEditRepo.Create(RandomUserEdit());
            Assert.That(await _userEditRepo.GetAllUserEdits(ProjId), Has.Count.EqualTo(1));

            await _userEditController.DeleteUserEdit(ProjId, origUserEdit.Id);
            Assert.That(await _userEditRepo.GetAllUserEdits(ProjId), Is.Empty);
        }

        [Test]
        public async Task TestDeleteUserEditMissingPermissions()
        {
            _userEditController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var userEdit = await _userEditRepo.Create(RandomUserEdit());
            var result = await _userEditController.DeleteUserEdit(ProjId, userEdit.Id);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestDeleteUserEditMissingUserEdit()
        {
            var noEditResult = await _userEditController.DeleteUserEdit(ProjId, MissingId);
            Assert.That(noEditResult, Is.InstanceOf<NotFoundObjectResult>());
        }
    }
}
