using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using BackendFramework.Services;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;
using System;
using System.Collections.Generic;

namespace Backend.Tests
{
    public class UserEditControllerTests
    {
        private IUserEditRepository _userEditRepo;
        private IUserEditService _userEditService;
        private UserEditController _userEditController;

        private IProjectService _projectService;
        private string _projId; 

        [SetUp]
        public void Setup()
        {
            _userEditRepo = new UserEditRepositoryMock();
            _userEditService = new UserEditService(_userEditRepo);
            _projectService = new ProjectServiceMock();
            _projId = _projectService.Create(new Project()).Result.Id;
            _userEditController = new UserEditController(_userEditRepo, _userEditService, _projectService);
        }

        UserEdit RandomUserEdit()
        {
            Random rnd = new Random();
            int count = rnd.Next(0, 7);

            UserEdit userEdit = new UserEdit();
            Edit edit = new Edit
            {
                GoalType = count,
                StepData = new List<string>() { Util.randString() }
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
            UserEdit userEdit = _userEditRepo.Create(RandomUserEdit()).Result;

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
            UserEdit userEdit = new UserEdit();
            userEdit.ProjectId = _projId;
            string id = (_userEditController.Post(_projId).Result as ObjectResult).Value as string;
            userEdit.Id = id;
            Assert.Contains(userEdit, _userEditRepo.GetAllUserEdits(_projId).Result);
        }

        [Test]
        public void TestAddEditsToGoal()
        {
            UserEdit userEdit = RandomUserEdit();
            _userEditRepo.Create(userEdit);
            Edit newEditStep = new Edit();
            newEditStep.StepData.Add("This is a new step");
            UserEdit updateEdit = userEdit.Clone();
            updateEdit.Edits.Add(newEditStep);

            _ = _userEditController.Post(_projId, userEdit.Id, newEditStep).Result;

            var allUserEdits = _userEditRepo.GetAllUserEdits(_projId).Result;

            Assert.Contains(updateEdit, allUserEdits);
        }

        [Test]
        public void TestGoalToUserEdit()
        {
            //generate db entry to test
            Random rnd = new Random();
            int count = rnd.Next(1, 13);

            for (int i = 0; i < count; i++)
            {
                _ = _userEditRepo.Create(RandomUserEdit()).Result;
            }
            UserEdit origUserEdit = _userEditRepo.Create(RandomUserEdit()).Result;

            //generate correct result for comparison
            var modUserEdit = origUserEdit.Clone();
            string stringUserEdit = "This is another step added";
            modUserEdit.Edits[0].StepData.Add(stringUserEdit);

            //create wrapper object
            int modGoalIndex = 0;
            UserEditObjectWrapper wrapperobj = new UserEditObjectWrapper(modGoalIndex, stringUserEdit);

            var action = _userEditController.Put(_projId, origUserEdit.Id, wrapperobj);

            Assert.That(_userEditRepo.GetAllUserEdits(_projId).Result, Has.Count.EqualTo(count + 1));
            Assert.Contains(stringUserEdit, _userEditRepo.GetUserEdit(_projId, origUserEdit.Id).Result.Edits[modGoalIndex].StepData);
        }

        [Test]
        public void TestDeleteUserEdit()
        {
            UserEdit origUserEdit = _userEditRepo.Create(RandomUserEdit()).Result;

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