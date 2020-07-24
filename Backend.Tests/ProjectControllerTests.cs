using System.Collections.Generic;
using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;

namespace Backend.Tests
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
            var project = new Project { Name = Util.RandString(), SemanticDomains = new List<SemanticDomain>() };

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

            var projects = (_controller.Get().Result as ObjectResult).Value as List<Project>;
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
        public void TestEmailInviteToProject()
        {
            var project = _projectService.Create(RandomProject()).Result;
            var linkWithIdentifier = _projectService.CreateLinkWithToken(project, "example@address.com").Result;
            Assert.AreEqual(linkWithIdentifier, "/invite/" + project.Id + "/token123");
        }


        private static User RandomUser()
        {
            var user = new User { Email = Util.RandString() };
            return user;
        }
        [Test]
        public void TestValidateLink()
        {
            var user1 = _userService.Create(RandomUser()).Result;
            var user2 = _userService.Create(RandomUser()).Result;
            var user3 = _userService.Create(RandomUser()).Result;
            user1.Email = "example1@address.com";
            user2.Email = "example22@address.com";
            user3.Email = "example3@address.com";
            var project = RandomProject();
            var token1 = new EmailInvite(2, "example1@address.com");
            var token2 = new EmailInvite(2, "example2@address.com");
            var token3 = new EmailInvite(-2, "example3@address.com");
            project.InviteTokens.Add(token1);
            project.InviteTokens.Add(token2);
            project.InviteTokens.Add(token3);

            var status = (_controller.ValidateToken(project.Id, token1.Token).Result as ObjectResult).Value as bool[];
            Assert.AreEqual(status[0], true);
            Assert.AreEqual(status[1], true);

            /*status = (_controller.ValidateToken(project.Id, token2.Token).Result as ObjectResult).Value as bool[];
            Assert.AreEqual(status[0], true);
            Assert.AreEqual(status[1], false);

            status = (_controller.ValidateToken(project.Id, "FakeToken").Result as ObjectResult).Value as bool[];
            Assert.AreEqual(status[0], false);
            Assert.AreEqual(status[1], false);

            status = (_controller.ValidateToken(project.Id, token3.Token).Result as ObjectResult).Value as bool[];
            Assert.AreEqual(status[0], false);
            Assert.AreEqual(status[1], false);*/
        }
    }
}
