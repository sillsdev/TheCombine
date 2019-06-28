using Backend.Tests;
using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;
using System;
using System.Collections.Generic;

namespace Tests
{
    public class UserEditControllerTests
    {
        IUserEditService _userEditService;
        UserEditController controller;

        [SetUp]
        public void Setup()
        {
            _userEditService = new UserEditServiceMock();
            controller = new UserEditController(_userEditService);
        }

        UserEdit RandomUserEdit()
        {
            UserEdit userEdit = new UserEdit();
            Edit edit = new Edit
            {
                GoalType = GoalType.MergeDups,
                StepData = new List<string>() { "test" }
            };
            userEdit.Edits.Add(edit);
            return userEdit;
        }

        [Test]
        public void TestGetAllUserEdits()
        {
            _userEditService.Create(RandomUserEdit());
            _userEditService.Create(RandomUserEdit());
            _userEditService.Create(RandomUserEdit());

            var userEdits = (controller.Get().Result as ObjectResult).Value as List<UserEdit>;
            Assert.That(userEdits, Has.Count.EqualTo(3));
            _userEditService.GetAllUserEdits().Result.ForEach(userEdit => Assert.Contains(userEdit, userEdits));
        }

        [Test]
        public void TestGetUserEdit()
        {
            UserEdit userEdit = _userEditService.Create(RandomUserEdit()).Result;

            _userEditService.Create(RandomUserEdit());
            _userEditService.Create(RandomUserEdit());

            var action = controller.Get(userEdit.Id).Result;

            Assert.That(action, Is.InstanceOf<ObjectResult>());

            var foundUserEdit = (action as ObjectResult).Value as UserEdit;
            Assert.AreEqual(userEdit, foundUserEdit);
        }

        [Test]
        public void TestCreateUserEdit()
        {
            UserEdit userEdit = RandomUserEdit();
            string id = (controller.Post(userEdit).Result as ObjectResult).Value as string;
            userEdit.Id = id;
            Assert.Contains(userEdit, _userEditService.GetAllUserEdits().Result);
        }

        [Test]
        public void TestUpdateUserEdit()
        {
            //generate db entry to test
            Random rnd = new Random();
            int count = rnd.Next(1, 13);
            
            for (int i = 0; i < count; i++)
            {
                _ = _userEditService.Create(RandomUserEdit()).Result;
            }
            UserEdit origUserEdit = _userEditService.Create(RandomUserEdit()).Result;

            //generate correct result for comparison
            var modUserEdit = origUserEdit.Clone();
            string stringUserEdit = "This is another step added";
            modUserEdit.Edits[modUserEdit.Edits.Count - 1].StepData.Add(stringUserEdit);
            
            //create wrapper object
            int modGoalIndex = 0;
            UserEditObjectWrapper wrapperobj = new UserEditObjectWrapper(modGoalIndex, stringUserEdit);
            
            var action = controller.Put(origUserEdit.Id, wrapperobj);

            Assert.That(_userEditService.GetAllUserEdits().Result, Has.Count.EqualTo(count + 1));
            Assert.Contains(stringUserEdit, _userEditService.GetUserEdit(origUserEdit.Id).Result.Edits[modGoalIndex].StepData);
        }

        [Test]
        public void TestDeleteUserEdit()
        {
            UserEdit origUserEdit = _userEditService.Create(RandomUserEdit()).Result;

            Assert.That(_userEditService.GetAllUserEdits().Result, Has.Count.EqualTo(1));

            _ = controller.Delete(origUserEdit.Id).Result;

            Assert.That(_userEditService.GetAllUserEdits().Result, Has.Count.EqualTo(0));
        }

        [Test]
        public void TestDeleteAllUserEdits()
        {
            _userEditService.Create(RandomUserEdit());
            _userEditService.Create(RandomUserEdit());
            _userEditService.Create(RandomUserEdit());

            Assert.That(_userEditService.GetAllUserEdits().Result, Has.Count.EqualTo(3));

            _ = controller.Delete().Result;

            Assert.That(_userEditService.GetAllUserEdits().Result, Has.Count.EqualTo(0));
        }
    }
}