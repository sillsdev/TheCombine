using Backend.Tests;
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
        IUserEditRepository _userEditRepo;
        IUserEditService _userEditService;
        IUserService _userService;
        UserEditController userEditController;
        UserController userController;

        [SetUp]
        public void Setup()
        {
            _userEditRepo = new UserEditRepositoryMock();
            _userService = new UserServiceMock();
            _userEditService = new UserEditService(_userEditRepo);
            userEditController = new UserEditController(_userEditService, _userEditRepo);
            userController = new UserController(_userService);
        }

        UserEdit RandomUserEdit()
        {
            Random rnd = new Random();
            int count = rnd.Next(0, 7);

            UserEdit userEdit = new UserEdit();
            Edit edit = new Edit
            {
                GoalType = (GoalType)count,
                StepData = new List<string>() { Util.randString() }
            };
            userEdit.Edits.Add(edit);
            return userEdit;
        }

        [Test]
        public void TestGetAllUserEdits()
        {
            _userEditRepo.Create(RandomUserEdit());
            _userEditRepo.Create(RandomUserEdit());
            _userEditRepo.Create(RandomUserEdit());

            var getResult = userEditController.Get().Result;

            Assert.IsInstanceOf<ObjectResult>(getResult);

            var edits = (getResult as ObjectResult).Value as List<UserEdit>;
            Assert.That(edits, Has.Count.EqualTo(3));
            _userEditRepo.GetAllUserEdits().Result.ForEach(edit => Assert.Contains(edit, edits));
        }

        [Test]
        public void TestGetUserEdit()
        {
            //Get UserEdit for nonexistant user
            var noUser = userEditController.Get(Guid.NewGuid().ToString()).Result;

            var getResult = userEditController.Get().Result;

            Assert.IsInstanceOf<ObjectResult>(getResult);

            var edits = (getResult as ObjectResult).Value as List<UserEdit>;
            Assert.That(edits, Has.Count.EqualTo(1));

            //Get a valid UserEdit
            UserEdit userEdit = _userEditRepo.Create(RandomUserEdit()).Result;

            _userEditRepo.Create(RandomUserEdit());
            _userEditRepo.Create(RandomUserEdit());

            var action = userEditController.Get(userEdit.Id).Result;

            Assert.That(action, Is.InstanceOf<ObjectResult>());

            var foundUserEdit = (action as ObjectResult).Value as UserEdit;
            Assert.AreEqual(userEdit, foundUserEdit);
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

            _ = userEditController.Post(userEdit.Id, newEditStep).Result;

            var allUserEdits = _userEditRepo.GetAllUserEdits().Result;

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

            var action = userEditController.Put(origUserEdit.Id, wrapperobj);

            Assert.That(_userEditRepo.GetAllUserEdits().Result, Has.Count.EqualTo(count + 1));
            Assert.Contains(stringUserEdit, _userEditRepo.GetUserEdit(origUserEdit.Id).Result.Edits[modGoalIndex].StepData);
        }

        [Test]
        public void TestDeleteUserEdit()
        {
            UserEdit origUserEdit = _userEditRepo.Create(RandomUserEdit()).Result;

            Assert.That(_userEditRepo.GetAllUserEdits().Result, Has.Count.EqualTo(1));

            _ = userEditController.Delete(origUserEdit.Id).Result;

            Assert.That(_userEditRepo.GetAllUserEdits().Result, Has.Count.EqualTo(0));
        }

        [Test]
        public void TestDeleteAllUserEdits()
        {
            _userEditRepo.Create(RandomUserEdit());
            _userEditRepo.Create(RandomUserEdit());
            _userEditRepo.Create(RandomUserEdit());

            Assert.That(_userEditRepo.GetAllUserEdits().Result, Has.Count.EqualTo(3));

            _ = userEditController.Delete().Result;

            Assert.That(_userEditRepo.GetAllUserEdits().Result, Has.Count.EqualTo(0));
        }
    }
}