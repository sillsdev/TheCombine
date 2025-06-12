using System;
using System.Collections.Generic;
using Backend.Tests.Mocks;
using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;

namespace Backend.Tests.Controllers
{
    public class ProjectControllerTests : IDisposable
    {
        private IProjectRepository _projRepo = null!;
        private IUserRepository _userRepo = null!;
        private ProjectController _projController = null!;

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (disposing)
            {
                _projController?.Dispose();
            }
        }

        [SetUp]
        public void Setup()
        {
            _projRepo = new ProjectRepositoryMock();
            _userRepo = new UserRepositoryMock();
            _projController = new ProjectController(
                _projRepo, new UserRoleRepositoryMock(), _userRepo, new PermissionServiceMock(_userRepo));

            var _userId = _userRepo.Create(new() { Username = "user", Password = "pass" }).Result!.Id;
            _projController.ControllerContext.HttpContext = PermissionServiceMock.HttpContextWithUserId(_userId);
        }

        [Test]
        public void TestGetAllProjects()
        {
            _projRepo.Create(Util.RandomProject());
            _projRepo.Create(Util.RandomProject());
            _projRepo.Create(Util.RandomProject());

            var projects = ((ObjectResult)_projController.GetAllProjects().Result).Value as List<Project>;
            Assert.That(projects, Has.Count.EqualTo(3));
            _projRepo.GetAllProjects().Result.ForEach(
                project => Assert.That(projects, Does.Contain(project).UsingPropertiesComparer()));
        }

        [Test]
        public void TestGetProject()
        {
            var project = _projRepo.Create(Util.RandomProject()).Result;

            _projRepo.Create(Util.RandomProject());
            _projRepo.Create(Util.RandomProject());

            var result = _projController.GetProject(project!.Id).Result;
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            Assert.That(((ObjectResult)result).Value, Is.EqualTo(project).UsingPropertiesComparer());
        }

        [Test]
        public void TestCreateProject()
        {
            var project = Util.RandomProject();
            var userProject = (UserCreatedProject)((ObjectResult)_projController.CreateProject(project).Result).Value!;
            project.Id = userProject.Project.Id;
            Assert.That(_projRepo.GetAllProjects().Result, Does.Contain(project).UsingPropertiesComparer());
        }

        [Test]
        public void TestUpdateProject()
        {
            var origProject = _projRepo.Create(Util.RandomProject()).Result;
            var modProject = origProject!.Clone();
            modProject.Name = "Mark";

            _ = _projController.UpdateProject(modProject.Id, modProject);
            Assert.That(_projRepo.GetAllProjects().Result, Has.Count.EqualTo(1));
            Assert.That(_projRepo.GetAllProjects().Result, Does.Contain(modProject).UsingPropertiesComparer());
        }

        [Test]
        public void TestDeleteProject()
        {
            var origProject = _projRepo.Create(Util.RandomProject()).Result;
            Assert.That(_projRepo.GetAllProjects().Result, Has.Count.EqualTo(1));

            _ = _projController.DeleteProject(origProject!.Id).Result;
            Assert.That(_projRepo.GetAllProjects().Result, Has.Count.EqualTo(0));
        }

        [Test]
        public void TestDeleteAllProjects()
        {
            _projRepo.Create(Util.RandomProject());
            _projRepo.Create(Util.RandomProject());
            _projRepo.Create(Util.RandomProject());
            Assert.That(_projRepo.GetAllProjects().Result, Has.Count.EqualTo(3));

            _ = _projController.DeleteAllProjects().Result;
            Assert.That(_projRepo.GetAllProjects().Result, Is.Empty);
        }

        [Test]
        public void TestProjectDuplicateCheck()
        {
            var project1 = _projRepo.Create(Util.RandomProject()).Result;
            _ = _projRepo.Create(Util.RandomProject()).Result;
            _ = _projRepo.Create(Util.RandomProject()).Result;
            var modProject = project1!.Clone();
            modProject.Name = "Proj";
            _ = _projController.UpdateProject(modProject.Id, modProject);
            var isOldProjDupResult = (ObjectResult)_projController.ProjectDuplicateCheck("Proj").Result;
            Assert.That(isOldProjDupResult.Value, Is.True);
            var isNewProjDupResult = (ObjectResult)_projController.ProjectDuplicateCheck("NewProj").Result;
            Assert.That(isNewProjDupResult.Value, Is.False);
        }
    }
}
