﻿using System;
using System.Collections.Generic;
using Backend.Tests.Mocks;
using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;

namespace Backend.Tests.Controllers
{
    public class SemanticDomainControllerTests : IDisposable
    {
        private ISemanticDomainRepository _semDomRepository = null!;
        private SemanticDomainController _semDomController = null!;

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (disposing)
            {
                _semDomController?.Dispose();
            }
        }

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
        public void GetAllSemanticDomainNamesFound()
        {
            var treeNodes = new List<SemanticDomainTreeNode> { new(_semDom) };
            ((SemanticDomainRepositoryMock)_semDomRepository).SetNextResponse(treeNodes);
            var names = ((OkObjectResult)_semDomController.GetAllSemanticDomainNames(Lang).Result).Value;
            Assert.That(names, Has.Count.EqualTo(1));
            Assert.That(((Dictionary<string, string>)names!)[Id], Is.EqualTo(Name));
        }

        [Test]
        public void GetAllSemanticDomainNamesNotFound()
        {
            var names = ((OkObjectResult)_semDomController.GetAllSemanticDomainNames(Lang).Result).Value;
            Assert.That(names, Has.Count.EqualTo(0));
        }

        [Test]
        public void GetSemanticDomainFullDomainFound()
        {
            ((SemanticDomainRepositoryMock)_semDomRepository).SetNextResponse(_semDom);
            var domain = (SemanticDomainFull?)(
                (ObjectResult)_semDomController.GetSemanticDomainFull(Id, Lang).Result).Value;
            Assert.That(domain?.Id, Is.EqualTo(Id));
            Assert.That(domain?.Lang, Is.EqualTo(Lang));
            Assert.That(domain?.Name, Is.EqualTo(Name));
        }

        [Test]
        public void GetSemanticDomainFullDomainNotFound()
        {
            ((SemanticDomainRepositoryMock)_semDomRepository).SetNextResponse(null);
            var domain = (SemanticDomainFull?)(
                (ObjectResult)_semDomController.GetSemanticDomainFull(Id, Lang).Result).Value;
            Assert.That(domain, Is.Null);
        }

        [Test]
        public void GetSemanticDomainTreeNodeDomainFound()
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
        public void GetSemanticDomainTreeNodeDomainNotFound()
        {
            ((SemanticDomainRepositoryMock)_semDomRepository).SetNextResponse(null);
            var domain = (SemanticDomainTreeNode?)(
                (ObjectResult)_semDomController.GetSemanticDomainTreeNode(Id, Lang).Result).Value;
            Assert.That(domain, Is.Null);
        }

        [Test]
        public void GetSemanticDomainTreeNodeByNameDomainFound()
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
        public void GetSemanticDomainTreeNodeByNameDomainNotFound()
        {
            ((SemanticDomainRepositoryMock)_semDomRepository).SetNextResponse(null);
            var domain = (SemanticDomainTreeNode?)(
                (ObjectResult)_semDomController.GetSemanticDomainTreeNodeByName(Name, Lang).Result).Value;
            Assert.That(domain, Is.Null);
        }
    }
}
