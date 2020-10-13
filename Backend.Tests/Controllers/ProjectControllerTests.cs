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
        private IProjectService _projectService;
        private ISemDomParser _semDomParser;
        private ProjectController _controller;
        private UserRoleServiceMock _userRoleService;
        private IUserService _userService;
        private IPermissionService _permissionService;
        private User _jwtAuthenticatedUser;

        [SetUp]
        public void Setup()
        {
            _permissionService = new PermissionServiceMock();
            _projectService = new ProjectServiceMock();
            _semDomParser = new SemDomParser(_projectService);
            _userRoleService = new UserRoleServiceMock();
            _userService = new UserServiceMock();
            _controller = new ProjectController(_projectService, _semDomParser, _userRoleService, _userService,
                _permissionService)
            {
                // Mock the Http Context because this isn't an actual call avatar controller
                ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
            };

            _jwtAuthenticatedUser = new User { Username = "user", Password = "pass" };
            _userService.Create(_jwtAuthenticatedUser);
            _jwtAuthenticatedUser = _userService.Authenticate(
                _jwtAuthenticatedUser.Username, _jwtAuthenticatedUser.Password).Result;

            _controller.ControllerContext.HttpContext.Request.Headers["UserId"] = _jwtAuthenticatedUser.Id;
        }

        private static Project RandomProject()
        {
            var project = new Project
            {
                Name = Util.RandString(),
                VernacularWritingSystem = { Name = Util.RandString(), Bcp47 = Util.RandString(), Font = Util.RandString() },
                AnalysisWritingSystems = new List<WritingSystem>(),
                SemanticDomains = new List<SemanticDomain>()
            };
            project.AnalysisWritingSystems.Add(new WritingSystem());
            project.AnalysisWritingSystems[0].Name = Util.RandString();
            project.AnalysisWritingSystems[0].Bcp47 = Util.RandString();
            project.AnalysisWritingSystems[0].Font = Util.RandString();

            for (var i = 1; i < 4; i++)
            {
                project.SemanticDomains.Add(new SemanticDomain()
                {
                    Id = $"{i}",
                    Name = Util.RandString(),
                    Description = Util.RandString()
                });
                for (var j = 1; j < 4; j++)
                {
                    project.SemanticDomains.Add(new SemanticDomain()
                    {
                        Id = $"{i}.{j}",
                        Name = Util.RandString(),
                        Description = Util.RandString()
                    });
                    for (var k = 1; k < 4; k++)
                    {
                        project.SemanticDomains.Add(new SemanticDomain()
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
            _projectService.Create(RandomProject());
            _projectService.Create(RandomProject());
            _projectService.Create(RandomProject());

            var projects = (_controller.GetAllProjects().Result as ObjectResult).Value as List<Project>;
            Assert.That(projects, Has.Count.EqualTo(3));
            _projectService.GetAllProjects().Result.ForEach(project => Assert.Contains(project, projects));
        }

        [Test]
        public void TestGetProject()
        {
            var project = _projectService.Create(RandomProject()).Result;

            _projectService.Create(RandomProject());
            _projectService.Create(RandomProject());

            var action = _controller.Get(project.Id).Result;
            Assert.That(action, Is.InstanceOf<ObjectResult>());

            var foundProjects = (action as ObjectResult).Value as Project;
            Assert.AreEqual(project, foundProjects);
        }

        [Test]
        public void TestCreateProject()
        {
            var project = RandomProject();
            var projectUser = new ProjectWithUser(project);
            var id = ((_controller.Post(projectUser).Result as ObjectResult).Value as ProjectWithUser).Id as string;
            project.Id = id;
            Assert.Contains(project, _projectService.GetAllProjects().Result);
        }

        [Test]
        public void TestUpdateProject()
        {
            var origProject = _projectService.Create(RandomProject()).Result;
            var modProject = origProject.Clone();
            modProject.Name = "Mark";

            _ = _controller.Put(modProject.Id, modProject);
            Assert.That(_projectService.GetAllProjects().Result, Has.Count.EqualTo(1));
            Assert.Contains(modProject, _projectService.GetAllProjects().Result);
        }

        [Test]
        public void TestDeleteProject()
        {
            var origProject = _projectService.Create(RandomProject()).Result;
            Assert.That(_projectService.GetAllProjects().Result, Has.Count.EqualTo(1));

            _ = _controller.Delete(origProject.Id).Result;
            Assert.That(_projectService.GetAllProjects().Result, Has.Count.EqualTo(0));
        }

        [Test]
        public void TestDeleteAllProjects()
        {
            _projectService.Create(RandomProject());
            _projectService.Create(RandomProject());
            _projectService.Create(RandomProject());
            Assert.That(_projectService.GetAllProjects().Result, Has.Count.EqualTo(3));

            _ = _controller.Delete().Result;
            Assert.That(_projectService.GetAllProjects().Result, Has.Count.EqualTo(0));
        }

        [Test]
        public void TestParseSemanticDomains()
        {
            var project = _projectService.Create(RandomProject()).Result;
            var sdList = (
                _controller.GetSemDoms(project.Id).Result as ObjectResult).Value as List<SemanticDomainWithSubdomains>;
            Assert.That(sdList, Has.Count.EqualTo(3));
            Assert.That(sdList[0].Subdomains, Has.Count.EqualTo(3));
            Assert.That(sdList[0].Subdomains[0].Subdomains, Has.Count.EqualTo(3));
        }

        [Test]
        public void TestProjectDuplicateCheck()
        {
            var project1 = _projectService.Create(RandomProject()).Result;
            var project2 = _projectService.Create(RandomProject()).Result;
            var project3 = _projectService.Create(RandomProject()).Result;
            var modProject = project1.Clone();
            modProject.Name = "Proj";
            _ = _controller.Put(modProject.Id, modProject);

            Assert.AreEqual(_projectService.DuplicateCheck("Proj").Result, true);
            Assert.AreEqual(_projectService.DuplicateCheck("NewProj").Result, false);
        }
    }
}
