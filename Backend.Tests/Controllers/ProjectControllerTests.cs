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
    public class ProjectControllerTests
    {
        private IProjectRepository _projRepo = null!;
        private IUserRepository _userRepo = null!;
        private UserRoleRepositoryMock _userRoleRepo = null!;
        private IPermissionService _permissionService = null!;
        private ISemanticDomainService _semDomService = null!;
        private ProjectController _projController = null!;

        private User _jwtAuthenticatedUser = null!;

        [SetUp]
        public void Setup()
        {
            _projRepo = new ProjectRepositoryMock();
            _userRepo = new UserRepositoryMock();
            _userRoleRepo = new UserRoleRepositoryMock();
            _permissionService = new PermissionServiceMock(_userRepo);
            _semDomService = new SemanticDomainService();
            _projController = new ProjectController(_projRepo, _semDomService, _userRoleRepo,
                _userRepo, _permissionService)
            {
                // Mock the Http Context because this isn't an actual call avatar controller
                ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
            };

            _jwtAuthenticatedUser = new User { Username = "user", Password = "pass" };
            _userRepo.Create(_jwtAuthenticatedUser);
            _jwtAuthenticatedUser = _permissionService.Authenticate(
                _jwtAuthenticatedUser.Username, _jwtAuthenticatedUser.Password).Result ?? throw new Exception();

            _projController.ControllerContext.HttpContext.Request.Headers["UserId"] = _jwtAuthenticatedUser.Id;
        }

        [Test]
        public void TestGetAllProjects()
        {
            _projRepo.Create(Util.RandomProject());
            _projRepo.Create(Util.RandomProject());
            _projRepo.Create(Util.RandomProject());

            var projects = ((ObjectResult)_projController.GetAllProjects().Result).Value as List<Project>;
            Assert.That(projects, Has.Count.EqualTo(3));
            _projRepo.GetAllProjects().Result.ForEach(project => Assert.Contains(project, projects));
        }

        [Test]
        public void TestGetProject()
        {
            var project = _projRepo.Create(Util.RandomProject()).Result;

            _projRepo.Create(Util.RandomProject());
            _projRepo.Create(Util.RandomProject());

            var action = _projController.GetProject(project!.Id).Result;
            Assert.IsInstanceOf<ObjectResult>(action);

            var foundProjects = ((ObjectResult)action).Value as Project;
            Assert.AreEqual(project, foundProjects);
        }

        [Test]
        public void TestCreateProject()
        {
            var project = Util.RandomProject();
            var userProject = (UserCreatedProject)((ObjectResult)_projController.CreateProject(project).Result).Value!;
            project.Id = userProject.Project.Id;
            Assert.Contains(project, _projRepo.GetAllProjects().Result);
        }

        [Test]
        public void TestUpdateProject()
        {
            var origProject = _projRepo.Create(Util.RandomProject()).Result;
            var modProject = origProject!.Clone();
            modProject.Name = "Mark";

            _ = _projController.UpdateProject(modProject.Id, modProject);
            Assert.That(_projRepo.GetAllProjects().Result, Has.Count.EqualTo(1));
            Assert.Contains(modProject, _projRepo.GetAllProjects().Result);
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
            Assert.That(_projRepo.GetAllProjects().Result, Has.Count.EqualTo(0));
        }

        [Test]
        public void TestParseSemanticDomains()
        {
            var project = _projRepo.Create(Util.RandomProject()).Result;
            var sdList = (List<SemanticDomainWithSubdomains>)(
                (ObjectResult)_projController.GetSemDoms(project!.Id).Result).Value!;
            Assert.That(sdList, Has.Count.EqualTo(3));
            Assert.That(sdList[0].Subdomains, Has.Count.EqualTo(3));
            Assert.That(sdList[0].Subdomains[0].Subdomains, Has.Count.EqualTo(3));
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
            var isOldProjDup =
                ((ObjectResult)_projController.ProjectDuplicateCheck("Proj").Result).Value!;
            Assert.IsTrue((bool)isOldProjDup);
            var isNewProjDup =
                ((ObjectResult)_projController.ProjectDuplicateCheck("NewProj").Result).Value!;
            Assert.IsFalse((bool)isNewProjDup);
        }
    }
}
