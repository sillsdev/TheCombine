using Backend.Tests;
using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;
using System;
using System.Collections.Generic;

namespace Tests
{
    public class ProjectControllerTests
    {
        IProjectService _projectService;
        ProjectController controller;

        [SetUp]
        public void Setup()
        {
            _projectService = new ProjectServiceMock();
            controller = new ProjectController(_projectService);
        }

        Project testProject()
        {
            Project project = new Project();
            // let's add some random data
            project.Name = Convert.ToBase64String(Guid.NewGuid().ToByteArray()).Substring(0, 4);
            return project;
        }

        [Test]
        public void TestGetAllProjects()
        {
            _projectService.Create(testProject());
            _projectService.Create(testProject());
            _projectService.Create(testProject());

            var projects = (controller.Get().Result as ObjectResult).Value as List<Project>;
            Assert.That(projects, Has.Count.EqualTo(3));
            _projectService.GetAllProjects().Result.ForEach(project => Assert.Contains(project, projects));
        }

        [Test]
        public void TestGetProject()
        {
            Project project = _projectService.Create(testProject()).Result;

            _projectService.Create(testProject());
            _projectService.Create(testProject());

            var action = controller.Get(project.Id).Result;

            Assert.That(action, Is.InstanceOf<ObjectResult>());

            var foundProjects = (action as ObjectResult).Value as List<Project>;
            Assert.That(foundProjects, Has.Count.EqualTo(1));
            Assert.AreEqual(project, foundProjects[0]);
        }

        [Test]
        public void TestCreateProject()
        {
            Project project = testProject();
            string id = (controller.Post(project).Result as ObjectResult).Value as string;
            project.Id = id;
            Assert.Contains(project, _projectService.GetAllProjects().Result);
        }

        [Test]
        public void TestUpdateProject()
        {
            Project origProject = _projectService.Create(testProject()).Result;

            Project modProject = origProject.Clone();
            modProject.Name = "Mark";

            var action = controller.Put(modProject.Id, modProject);

            Assert.That(_projectService.GetAllProjects().Result, Has.Count.EqualTo(1));
            Assert.Contains(modProject, _projectService.GetAllProjects().Result);
        }

        [Test]
        public void TestDeleteProject()
        {
            Project origProject = _projectService.Create(testProject()).Result;

            Assert.That(_projectService.GetAllProjects().Result, Has.Count.EqualTo(1));

            var action = controller.Delete(origProject.Id).Result;

            Assert.That(_projectService.GetAllProjects().Result, Has.Count.EqualTo(0));
        }
    }
}