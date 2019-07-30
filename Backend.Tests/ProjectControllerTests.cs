using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using BackendFramework.Services;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;
using System.Collections.Generic;
using static BackendFramework.Controllers.ProjectController;

namespace Backend.Tests
{
    [Parallelizable(ParallelScope.Self)]
    public class ProjectControllerTests
    {
        private IProjectService _projectService;
        private ISemDomParser _semDomParser;
        private ProjectController _controller;
        private UserRoleServiceMock _userRoleService;
        private IUserService _userService;
        private IPermissionService _permissionService;
        private User _JwtAuthenticatedUser;

        [SetUp]
        public void Setup()
        {
            _permissionService = new PermissionServiceMock();
            _projectService = new ProjectServiceMock();
            _semDomParser = new SemDomParser(_projectService);
            _userRoleService = new UserRoleServiceMock();
            _userService = new UserServiceMock();
            _controller = new ProjectController(_projectService, _semDomParser, _userRoleService, _userService, _permissionService);

            //mock the Http Context because this isnt an actual call
            //avatar controller
            _controller.ControllerContext = new ControllerContext();
            _controller.ControllerContext.HttpContext = new DefaultHttpContext();
            _JwtAuthenticatedUser = new User();
            _JwtAuthenticatedUser.Username = "user";
            _JwtAuthenticatedUser.Password = "pass";
            _userService.Create(_JwtAuthenticatedUser);
            _JwtAuthenticatedUser = _userService.Authenticate(_JwtAuthenticatedUser.Username, _JwtAuthenticatedUser.Password).Result;

            _controller.ControllerContext.HttpContext.Request.Headers["UserId"] = _JwtAuthenticatedUser.Id;
        }

        Project RandomProject()
        {
            Project project = new Project();
            project.Name = Util.randString();

            project.SemanticDomains = new List<SemanticDomain>();
            for (int i = 1; i < 4; i++)
            {
                project.SemanticDomains.Add(new SemanticDomain() { Id = $"{i}", Name = Util.randString(), Description = Util.randString() });
                for (int j = 1; j < 4; j++)
                {
                    project.SemanticDomains.Add(new SemanticDomain() { Id = $"{i}.{j}", Name = Util.randString(), Description = Util.randString() });
                    for (int k = 1; k < 4; k++)
                    {
                        project.SemanticDomains.Add(new SemanticDomain() { Id = $"{i}.{j}.{k}", Name = Util.randString(), Description = Util.randString() });
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

            var projects = (_controller.Get().Result as ObjectResult).Value as List<Project>;
            Assert.That(projects, Has.Count.EqualTo(3));
            _projectService.GetAllProjects().Result.ForEach(project => Assert.Contains(project, projects));
        }

        [Test]
        public void TestGetProject()
        {
            Project project = _projectService.Create(RandomProject()).Result;

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
            ProjectWithUser projectUser = new ProjectWithUser(project);
            string id = ((_controller.Post(projectUser).Result as ObjectResult).Value as ProjectWithUser).Id as string;
            project.Id = id;
            Assert.Contains(project, _projectService.GetAllProjects().Result);
        }

        [Test]
        public void TestUpdateProject()
        {
            Project origProject = _projectService.Create(RandomProject()).Result;

            Project modProject = origProject.Clone();
            modProject.Name = "Mark";

            _ = _controller.Put(modProject.Id, modProject);

            Assert.That(_projectService.GetAllProjects().Result, Has.Count.EqualTo(1));
            Assert.Contains(modProject, _projectService.GetAllProjects().Result);
        }

        [Test]
        public void TestDeleteProject()
        {
            Project origProject = _projectService.Create(RandomProject()).Result;

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
            var sdList = (_controller.GetSemDoms(project.Id).Result as ObjectResult).Value as List<SemanticDomainWithSubdomains>;
            Assert.That(sdList, Has.Count.EqualTo(3));
            Assert.That(sdList[0].Subdomains, Has.Count.EqualTo(3));
            Assert.That(sdList[0].Subdomains[0].Subdomains, Has.Count.EqualTo(3));
        }
    }
}