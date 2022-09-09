using Backend.Tests.Mocks;
using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;

namespace Backend.Tests.Controllers
{
    public class SemanticDomainControllerTests
    {
        private ISemanticDomainRepository _semDomRepository = null!;
        private SemanticDomainController _semDomController = null!;

        private const string Id = "1";
        private const string Lang = "en";
        private const string Name = "Universe";

        private readonly SemanticDomainFull _semDom = new() { Id = Id, Lang = Lang, Name = Name };

        [SetUp]
        public void Setup()
        {
            _semDomRepository = new SemanticDomainRepositoryMock();
            _semDomController = new SemanticDomainController(_semDomRepository);
        }

        [Test]
        public void SemanticDomainController_GetSemanticDomainFull_DomainFound()
        {
            ((SemanticDomainRepositoryMock)_semDomRepository).SetNextResponse(_semDom);
            var domain = (SemanticDomainFull?)(
                (ObjectResult)_semDomController.GetSemanticDomainFull(Id, Lang).Result).Value;
            Assert.That(domain?.Id, Is.EqualTo(Id));
            Assert.That(domain?.Lang, Is.EqualTo(Lang));
            Assert.That(domain?.Name, Is.EqualTo(Name));
        }

        [Test]
        public void SemanticDomainController_GetSemanticDomainFull_DomainNotFound()
        {
            ((SemanticDomainRepositoryMock)_semDomRepository).SetNextResponse(null);
            var domain = (SemanticDomainFull?)(
                (ObjectResult)_semDomController.GetSemanticDomainFull(Id, Lang).Result).Value;
            Assert.That(domain, Is.Null);
        }

        [Test]
        public void SemanticDomainController_GetSemanticDomainTreeNode_DomainFound()
        {
            var treeNode = new SemanticDomainTreeNode(_semDom);
            ((SemanticDomainRepositoryMock)_semDomRepository).SetNextResponse(treeNode);
            var domain = (SemanticDomainTreeNode?)(
                (ObjectResult)_semDomController.GetSemanticDomainTreeNode(Id, Lang).Result).Value;
            Assert.That(domain?.Id, Is.EqualTo(Id));
            Assert.That(domain?.Lang, Is.EqualTo(Lang));
            Assert.That(domain?.Name, Is.EqualTo(Name));
        }

        [Test]
        public void SemanticDomainController_GetSemanticDomainTreeNode_DomainNotFound()
        {
            ((SemanticDomainRepositoryMock)_semDomRepository).SetNextResponse(null);
            var domain = (SemanticDomainTreeNode?)(
                (ObjectResult)_semDomController.GetSemanticDomainTreeNode(Id, Lang).Result).Value;
            Assert.That(domain, Is.Null);
        }

        [Test]
        public void SemanticDomainController_GetSemanticDomainTreeNodeByName_DomainFound()
        {
            var treeNode = new SemanticDomainTreeNode(_semDom);
            ((SemanticDomainRepositoryMock)_semDomRepository).SetNextResponse(treeNode);
            var domain = (SemanticDomainTreeNode?)(
                (ObjectResult)_semDomController.GetSemanticDomainTreeNodeByName(Name, Lang).Result).Value;
            Assert.That(domain?.Id, Is.EqualTo(Id));
            Assert.That(domain?.Lang, Is.EqualTo(Lang));
            Assert.That(domain?.Name, Is.EqualTo(Name));
        }

        [Test]
        public void SemanticDomainController_GetSemanticDomainTreeNodeByName_DomainNotFound()
        {
            ((SemanticDomainRepositoryMock)_semDomRepository).SetNextResponse(null);
            var domain = (SemanticDomainTreeNode?)(
                (ObjectResult)_semDomController.GetSemanticDomainTreeNodeByName(Name, Lang).Result).Value;
            Assert.That(domain, Is.Null);
        }
    }
}
