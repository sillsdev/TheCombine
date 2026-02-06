using System;
using System.Threading.Tasks;
using Backend.Tests.Mocks;
using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;

namespace Backend.Tests.Controllers
{
    internal sealed class StatisticsControllerTests : IDisposable
    {
        private IProjectRepository _projRepo = null!;
        private IUserRepository _userRepo = null!;
        private IPermissionService _permService = null!;
        private StatisticsController _statsController = null!;

        public void Dispose()
        {
            _statsController?.Dispose();
            GC.SuppressFinalize(this);
        }

        private User _jwtAuthenticatedUser = null!;
        private string _projId = null!;
        private const string MissingId = "MISSING_ID";

        [SetUp]
        public async Task Setup()
        {
            _projRepo = new ProjectRepositoryMock();
            _userRepo = new UserRepositoryMock();
            _permService = new PermissionServiceMock(_userRepo);
            var statsService = new StatisticsServiceMock();
            _statsController = new StatisticsController(statsService, _permService, _projRepo)
            {
                // Mock the Http Context because this isn't an actual call controller
                ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
            };

            _jwtAuthenticatedUser = new User { Username = "user", Password = "pass" };
            await _userRepo.Create(_jwtAuthenticatedUser);
            _jwtAuthenticatedUser = await _permService.Authenticate(_jwtAuthenticatedUser.Username,
                _jwtAuthenticatedUser.Password) ?? throw new UserAuthenticationException();
            _projId = (await _projRepo.Create(new Project { Name = "StatisticsControllerTests" }))!.Id;
        }

        [Test]
        public async Task TestGetSemanticDomainCountsNoPermission()
        {
            _statsController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            var result = await _statsController.GetSemanticDomainCounts(_projId, "en");
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestGetSemanticDomainCounts()
        {
            var result = await _statsController.GetSemanticDomainCounts(_projId, "en");
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
        }

        [Test]
        public async Task TestGetWordsPerDayPerUserCountsNoPermission()
        {
            _statsController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            var result = await _statsController.GetWordsPerDayPerUserCounts(_projId);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestGetWordsPerDayPerUserCounts()
        {
            var result = await _statsController.GetWordsPerDayPerUserCounts(_projId);
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
        }

        [Test]
        public async Task TestGetProgressEstimationLineChartRootNoPermission()
        {
            _statsController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            var result = await _statsController.GetProgressEstimationLineChartRoot(_projId);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestGetProgressEstimationLineChartRootMissingProject()
        {
            var result = await _statsController.GetProgressEstimationLineChartRoot(MissingId);
            Assert.That(result, Is.InstanceOf<NotFoundResult>());
        }

        [Test]
        public async Task TestGetProgressEstimationLineChartRoot()
        {
            var result = await _statsController.GetProgressEstimationLineChartRoot(_projId);
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
        }

        [Test]
        public async Task TestGetLineChartRootDataNoPermission()
        {
            _statsController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            var result = await _statsController.GetLineChartRootData(_projId);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestGetLineChartRootData()
        {
            var result = await _statsController.GetLineChartRootData(_projId);
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
        }

        [Test]
        public async Task TestGetSemanticDomainUserCountsNoPermission()
        {
            _statsController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            var result = await _statsController.GetSemanticDomainUserCounts(_projId);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestGetSemanticDomainUserCounts()
        {
            var result = await _statsController.GetSemanticDomainUserCounts(_projId);
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
        }
    }
}
