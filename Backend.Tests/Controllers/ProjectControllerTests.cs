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

        private static Project RandomProject()
        {
            var project = new Project
            {
                Name = Util.RandString(),
                VernacularWritingSystem =
                {
                    Name = Util.RandString(), Bcp47 = Util.RandString(), Font = Util.RandString()
                },
                AnalysisWritingSystems = new List<WritingSystem>(),
                SemanticDomains = new List<SemanticDomain>()
            };
            project.AnalysisWritingSystems.Add(new WritingSystem());
            project.AnalysisWritingSystems[0].Name = Util.RandString();
            project.AnalysisWritingSystems[0].Bcp47 = Util.RandString();
            project.AnalysisWritingSystems[0].Font = Util.RandString();

            for (var i = 1; i < 4; i++)
            {
                project.SemanticDomains.Add(new SemanticDomain
                {
                    Id = $"{i}",
                    Name = Util.RandString(),
                    Description = Util.RandString()
                });
                for (var j = 1; j < 4; j++)
                {
                    project.SemanticDomains.Add(new SemanticDomain
                    {
                        Id = $"{i}.{j}",
                        Name = Util.RandString(),
                        Description = Util.RandString()
                    });
                    for (var k = 1; k < 4; k++)
                    {
                        project.SemanticDomains.Add(new SemanticDomain
                        {
                            Id = $"{i}.{j}.{k}",
                            Name = Util.RandString(),
                            Description = Util.RandString()
                        });
                    }
                }
            }

            return project;
        }

        [Test]
        public void TestGetAllProjects()
        {
            _projRepo.Create(RandomProject());
            _projRepo.Create(RandomProject());
            _projRepo.Create(RandomProject());

            var projects = ((ObjectResult)_projController.GetAllProjects().Result).Value as List<Project>;
            Assert.That(projects, Has.Count.EqualTo(3));
            _projRepo.GetAllProjects().Result.ForEach(project => Assert.Contains(project, projects));
        }

        [Test]
        public void TestGetProject()
        {
            var project = _projRepo.Create(RandomProject()).Result;

            _projRepo.Create(RandomProject());
            _projRepo.Create(RandomProject());

            var action = _projController.Get(project!.Id).Result;
            Assert.IsInstanceOf<ObjectResult>(action);

            var foundProjects = ((ObjectResult)action).Value as Project;
            Assert.AreEqual(project, foundProjects);
        }

        [Test]
        public void TestCreateProject()
        {
            var project = RandomProject();
            var projectUser = new ProjectWithUser(project);
            var id = ((ProjectWithUser)((ObjectResult)_projController.Post(projectUser).Result).Value).Id;
            project.Id = id;
            Assert.Contains(project, _projRepo.GetAllProjects().Result);
        }

        [Test]
        public void TestUpdateProject()
        {
            var origProject = _projRepo.Create(RandomProject()).Result;
            var modProject = origProject!.Clone();
            modProject.Name = "Mark";

            _ = _projController.Put(modProject.Id, modProject);
            Assert.That(_projRepo.GetAllProjects().Result, Has.Count.EqualTo(1));
            Assert.Contains(modProject, _projRepo.GetAllProjects().Result);
        }

        [Test]
        public void TestDeleteProject()
        {
            var origProject = _projRepo.Create(RandomProject()).Result;
            Assert.That(_projRepo.GetAllProjects().Result, Has.Count.EqualTo(1));

            _ = _projController.Delete(origProject!.Id).Result;
            Assert.That(_projRepo.GetAllProjects().Result, Has.Count.EqualTo(0));
        }

        [Test]
        public void TestDeleteAllProjects()
        {
            _projRepo.Create(RandomProject());
            _projRepo.Create(RandomProject());
            _projRepo.Create(RandomProject());
            Assert.That(_projRepo.GetAllProjects().Result, Has.Count.EqualTo(3));

            _ = _projController.Delete().Result;
            Assert.That(_projRepo.GetAllProjects().Result, Has.Count.EqualTo(0));
        }

        [Test]
        public void TestParseSemanticDomains()
        {
            var project = _projRepo.Create(RandomProject()).Result;
            var sdList = (List<SemanticDomainWithSubdomains>)(
                (ObjectResult)_projController.GetSemDoms(project!.Id).Result).Value;
            Assert.That(sdList, Has.Count.EqualTo(3));
            Assert.That(sdList[0].Subdomains, Has.Count.EqualTo(3));
            Assert.That(sdList[0].Subdomains[0].Subdomains, Has.Count.EqualTo(3));
        }

        [Test]
        public void TestProjectDuplicateCheck()
        {
            var project1 = _projRepo.Create(RandomProject()).Result;
            _ = _projRepo.Create(RandomProject()).Result;
            _ = _projRepo.Create(RandomProject()).Result;
            var modProject = project1!.Clone();
            modProject.Name = "Proj";
            _ = _projController.Put(modProject.Id, modProject);

            Assert.AreEqual(((ObjectResult)_projController.ProjectDuplicateCheck("Proj").Result).Value, true);
            Assert.AreEqual(((ObjectResult)_projController.ProjectDuplicateCheck("NewProj").Result).Value, false);
        }
    }
}
