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
        public void TestGetAllProjectsUnauthorized()
        {
            _projController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _projController.GetAllProjects().Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
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
        public void TestGetAllProjectUsersUnauthorized()
        {
            _projController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _projController.GetAllProjectUsers("any-project").Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public void TestGetAllProjectUsers()
        {
            const string projId = "some-project";
            _userRepo.Create(new() { Id = "1", ProjectRoles = { [projId] = "some-project-role" } });
            _userRepo.Create(new() { Id = "2", ProjectRoles = { [projId] = "other-project-role" } });
            _userRepo.Create(new() { Id = "not3" });
            var result = _projController.GetAllProjectUsers(projId).Result;
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            Assert.That(((OkObjectResult)result).Value, Has.Count.EqualTo(2));
        }

        [Test]
        public void TestGetProjectUnauthorized()
        {
            _projController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var project = _projRepo.Create(Util.RandomProject()).Result;
            var result = _projController.GetProject(project!.Id).Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public void TestGetProjectNoProject()
        {
            var result = _projController.GetProject("not-a-project").Result;
            Assert.That(result, Is.InstanceOf<NotFoundResult>());
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
        public void TestCreateProjectUnauthorized()
        {
            _projController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _projController.CreateProject(new()).Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
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
        public void TestUpdateProjectUnauthorized()
        {
            _projController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _projController.UpdateProject("any-project", new()).Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
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
        public void TestPutCharsUnauthorized()
        {
            _projController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _projController.PutChars("any-project", new()).Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public void TestPutCharsNoProject()
        {
            var result = _projController.PutChars("not-a-project", new()).Result;
            Assert.That(result, Is.InstanceOf<NotFoundResult>());
        }

        [Test]
        public void TestPutCharsNoChange()
        {
            var proj = _projRepo.Create(Util.RandomProject()).Result!;
            var result = _projController.PutChars(proj.Id, proj).Result;
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
        }

        [Test]
        public void TestPutCharsOnlyChangesChars()
        {
            // Setup
            var oldProj = _projRepo.Create(Util.RandomProject()).Result!;
            var newProj = Util.RandomProject();
            Assert.That(newProj.Id, Is.Not.EqualTo((oldProj.Id)));
            Assert.That(newProj.Name, Is.Not.EqualTo((oldProj.Name)));
            newProj.RejectedCharacters = ["!", "?"];
            newProj.ValidCharacters = ["a", "b", "c"];

            // Verify returned project
            var result = _projController.PutChars(oldProj.Id, newProj).Result;
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var resultProj = (Project)((OkObjectResult)result).Value!;
            Assert.That(resultProj.Id, Is.EqualTo(oldProj.Id));
            Assert.That(resultProj.Name, Is.EqualTo(oldProj.Name));
            Assert.That(resultProj.RejectedCharacters, Has.Count.EqualTo((2)));
            Assert.That(resultProj.ValidCharacters, Has.Count.EqualTo((3)));

            // Verify project in repo
            Assert.That(_projRepo.GetProject(newProj.Id).Result, Is.Null);
            var updatedProj = _projRepo.GetProject(oldProj.Id).Result!;
            Assert.That(updatedProj.Id, Is.EqualTo(oldProj.Id));
            Assert.That(updatedProj.Name, Is.EqualTo(oldProj.Name));
            Assert.That(updatedProj.RejectedCharacters, Has.Count.EqualTo((2)));
            Assert.That(updatedProj.ValidCharacters, Has.Count.EqualTo((3)));
        }

        [Test]
        public void TestDeleteProjectUnauthorized()
        {
            _projController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _projController.DeleteProject("any-project").Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public void TestDeleteProjectInvalidProjectId()
        {
            var result = _projController.DeleteProject("invalid/id").Result;
            Assert.That(result, Is.InstanceOf<UnsupportedMediaTypeResult>());
        }

        [Test]
        public void TestDeleteProjectNoProject()
        {
            var result = _projController.DeleteProject("not-a-project").Result;
            Assert.That(result, Is.InstanceOf<NotFoundResult>());
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
        public void TestProjectDuplicateCheckUnauthorized()
        {
            _projController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _projController.ProjectDuplicateCheck("any-project").Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
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
