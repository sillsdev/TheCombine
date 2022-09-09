using System;
using System.Collections.Generic;
using System.Threading.Tasks;
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
    public class SemanticDomainControllerTests
    {
        private IProjectRepository _projRepo = null!;
        private IUserRepository _userRepo = null!;
        private IPermissionService _permissionService = null!;
        private ISemanticDomainRepository _semDomRepository = null!;
        private SemanticDomainController _semDomController = null!;

        private User _jwtAuthenticatedUser = null!;

        [SetUp]
        public void Setup()
        {
            _projRepo = new ProjectRepositoryMock();
            _userRepo = new UserRepositoryMock();
            _permissionService = new PermissionServiceMock(_userRepo);
            _semDomRepository = new SemanticDomainRepositoryMock();
            _semDomController = new SemanticDomainController(_projRepo, _semDomRepository, _permissionService)
            {
                // Mock the Http Context because this isn't an actual call avatar controller
                ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
            };

            _jwtAuthenticatedUser = new User { Username = "user", Password = "pass" };
            _userRepo.Create(_jwtAuthenticatedUser);
            _jwtAuthenticatedUser = _permissionService.Authenticate(
                _jwtAuthenticatedUser.Username, _jwtAuthenticatedUser.Password).Result ?? throw new Exception();

            _semDomController.ControllerContext.HttpContext.Request.Headers["UserId"] = _jwtAuthenticatedUser.Id;
        }

        [Test]
        public void SemanticDomainController_GetSemanticDomainFull_DomainFound()
        {
            ((SemanticDomainRepositoryMock)_semDomRepository).SetNextResponse(new SemanticDomainFull() { Id = "1", Lang = "en", Name = "Universe" });
            var domain = (SemanticDomainFull?)(
                (ObjectResult)_semDomController.GetSemanticDomainFull("1", "en").Result).Value;
            Assert.That(domain?.Lang, Is.EqualTo("en"));
            Assert.That(domain?.Id, Is.EqualTo("1"));
        }

        [Test]
        public void SemanticDomainController_GetSemanticDomainFull_DomainNotFound()
        {
            ((SemanticDomainRepositoryMock)_semDomRepository).SetNextResponse(null);
            var domain = (SemanticDomainFull?)(
                (ObjectResult)_semDomController.GetSemanticDomainFull("1", "en").Result).Value;
            Assert.That(domain, Is.Null);
        }

        [Test]
        public void SemanticDomainController_GetSemanticDomainTreeNode_DomainFound()
        {
            ((SemanticDomainRepositoryMock)_semDomRepository).SetNextResponse(new SemanticDomainTreeNode(new SemanticDomain { Id = "1", Lang = "en", Name = "Universe" }));
            var domain = (SemanticDomainTreeNode?)(
                (ObjectResult)_semDomController.GetSemanticDomainTreeNode("1", "en").Result).Value;
            Assert.That(domain?.Lang, Is.EqualTo("en"));
            Assert.That(domain?.Id, Is.EqualTo("1"));
        }

        [Test]
        public void SemanticDomainController_GetSemanticDomainTreeNode_DomainNotFound()
        {
            ((SemanticDomainRepositoryMock)_semDomRepository).SetNextResponse(null);
            var domain = (SemanticDomainTreeNode?)(
                (ObjectResult)_semDomController.GetSemanticDomainTreeNode("1", "en").Result).Value;
            Assert.That(domain, Is.Null);
        }

        [Test]
        public void SemanticDomainController_GetSemanticDomainTreeNodeByName_DomainFound()
        {
            ((SemanticDomainRepositoryMock)_semDomRepository).SetNextResponse(new SemanticDomainTreeNode(new SemanticDomain { Id = "1", Lang = "en", Name = "Universe" }));
            var domain = (SemanticDomainTreeNode?)(
                (ObjectResult)_semDomController.GetSemanticDomainTreeNodeByName("Universe", "en").Result).Value;
            Assert.That(domain?.Lang, Is.EqualTo("en"));
            Assert.That(domain?.Id, Is.EqualTo("1"));
        }

        [Test]
        public void SemanticDomainController_GetSemanticDomainTreeNodeByName_DomainNotFound()
        {
            ((SemanticDomainRepositoryMock)_semDomRepository).SetNextResponse(null);
            var domain = (SemanticDomainTreeNode?)(
                (ObjectResult)_semDomController.GetSemanticDomainTreeNodeByName("1", "en").Result).Value;
            Assert.That(domain, Is.Null);
        }

        private class SemanticDomainRepositoryMock : ISemanticDomainRepository
        {
            private object? _responseObj;
            public Task<SemanticDomainFull?> GetSemanticDomainFull(string id, string lang)
            {
                return new Task<SemanticDomainFull?>(() => (SemanticDomainFull?)_responseObj);
            }

            public Task<SemanticDomainTreeNode?> GetSemanticDomainTreeNode(string id, string lang)
            {
                return new Task<SemanticDomainTreeNode?>(() => (SemanticDomainTreeNode?)_responseObj);
            }

            public Task<SemanticDomainTreeNode?> GetSemanticDomainTreeNodeByName(string name, string lang)
            {
                return new Task<SemanticDomainTreeNode?>(() => (SemanticDomainTreeNode?)_responseObj);
            }

            internal void SetNextResponse(object? response)
            {
                _responseObj = response;
            }
        }
    }
}
