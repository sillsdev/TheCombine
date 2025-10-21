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
    internal sealed class SemanticDomainControllerTests : IDisposable
    {
        private ISemanticDomainRepository _semDomRepository = null!;
        private SemanticDomainController _semDomController = null!;

        public void Dispose()
        {
            _semDomController?.Dispose();
            GC.SuppressFinalize(this);
        }

        private const string Id = "1";
        private const string Lang = "en";
        private const string Name = "Universe";
        private readonly SemanticDomain _semDom = new() { Id = Id, Lang = Lang, Name = Name };

        [SetUp]
        public void Setup()
        {
            _semDomRepository = new SemanticDomainRepositoryMock();
            _semDomController = new SemanticDomainController(_semDomRepository);
        }

        [Test]
        public void TestGetAllSemanticDomainNamesFound()
        {
            var treeNodes = new List<SemanticDomainTreeNode> { new(_semDom) };
            ((SemanticDomainRepositoryMock)_semDomRepository).SetNextResponse(treeNodes);
            var names = ((OkObjectResult)_semDomController.GetAllSemanticDomainNames(Lang).Result).Value;
            Assert.That(names, Has.Count.EqualTo(1));
            Assert.That(((Dictionary<string, string>)names!)[Id], Is.EqualTo(Name));
        }

        [Test]
        public void TestGetAllSemanticDomainNamesNotFound()
        {
            var names = ((OkObjectResult)_semDomController.GetAllSemanticDomainNames(Lang).Result).Value;
            Assert.That(names, Has.Count.EqualTo(0));
        }

        [Test]
        public void TestGetSemanticDomainFullDomainFound()
        {
            ((SemanticDomainRepositoryMock)_semDomRepository).SetNextResponse(new SemanticDomainFull(_semDom));
            var domain = (SemanticDomainFull?)(
                (ObjectResult)_semDomController.GetSemanticDomainFull(Id, Lang).Result).Value;
            Assert.That(domain?.Id, Is.EqualTo(Id));
            Assert.That(domain?.Lang, Is.EqualTo(Lang));
            Assert.That(domain?.Name, Is.EqualTo(Name));
        }

        [Test]
        public void TestGetSemanticDomainFullDomainNotFound()
        {
            ((SemanticDomainRepositoryMock)_semDomRepository).SetNextResponse(null);
            var domain = ((ObjectResult)_semDomController.GetSemanticDomainFull(Id, Lang).Result).Value;
            Assert.That(domain, Is.Null);
        }

        [Test]
        public void TestGetSemanticDomainTreeNodeDomainFound()
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
        public void TestGetSemanticDomainTreeNodeDomainNotFound()
        {
            ((SemanticDomainRepositoryMock)_semDomRepository).SetNextResponse(null);
            var domain = ((ObjectResult)_semDomController.GetSemanticDomainTreeNode(Id, Lang).Result).Value;
            Assert.That(domain, Is.Null);
        }

        [Test]
        public void TestGetSemanticDomainTreeNodeByNameDomainFound()
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
        public void TestGetSemanticDomainTreeNodeByNameDomainNotFound()
        {
            ((SemanticDomainRepositoryMock)_semDomRepository).SetNextResponse(null);
            var domain = ((ObjectResult)_semDomController.GetSemanticDomainTreeNodeByName(Name, Lang).Result).Value;
            Assert.That(domain, Is.Null);
        }

        [Test]
        public void TestGetAllSemanticDomainTreeNodesFound()
        {
            ((SemanticDomainRepositoryMock)_semDomRepository).SetNextResponse(new List<SemanticDomainTreeNode>());
            var list = ((ObjectResult)_semDomController.GetAllSemanticDomainTreeNodes(Lang).Result).Value;
            Assert.That(list, Has.Count.EqualTo(0));
        }

        [Test]
        public void TestGetAllSemanticDomainTreeNodesNotFound()
        {
            ((SemanticDomainRepositoryMock)_semDomRepository).SetNextResponse(null);
            var list = ((ObjectResult)_semDomController.GetAllSemanticDomainTreeNodes(Lang).Result).Value;
            Assert.That(list, Is.Null);
        }
    }
}
