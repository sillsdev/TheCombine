using System;
using Backend.Tests.Mocks;
using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;

namespace Backend.Tests.Controllers
{
    public class BannerControllerTests : IDisposable
    {
        private IBannerRepository _bannerRepo = null!;
        private IPermissionService _permissionService = null!;
        private BannerController _bannerController = null!;

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (disposing)
            {
                _bannerController?.Dispose();
            }
        }

        private const BannerType Type = BannerType.Login;
        private const string Text = "Login Banner Text";
        private readonly SiteBanner _siteBanner = new() { Type = Type, Text = Text };

        [SetUp]
        public void Setup()
        {
            _bannerRepo = new BannerRepositoryMock();
            _permissionService = new PermissionServiceMock();
            _bannerController = new BannerController(_bannerRepo, _permissionService);
        }

        [Test]
        public void TestUpdateBanner()
        {
            var updateResult = (ObjectResult)_bannerController.UpdateBanner(_siteBanner).Result;
            Assert.That(updateResult.Value, Is.True);
            var bannerResult = (ObjectResult)_bannerController.GetBanner(Type).Result;
            Assert.That(bannerResult.Value, Is.EqualTo(_siteBanner).UsingPropertiesComparer());
        }

        [Test]
        public void TestUpdateBannerNoPermission()
        {
            _bannerController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _bannerController.UpdateBanner(_siteBanner).Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public void TestGetBannerNoPermission()
        {
            var updateResult = (ObjectResult)_bannerController.UpdateBanner(_siteBanner).Result;
            Assert.That(updateResult.Value, Is.True);
            _bannerController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var bannerResult = (ObjectResult)_bannerController.GetBanner(Type).Result;
            Assert.That(bannerResult.Value, Is.EqualTo(_siteBanner).UsingPropertiesComparer());
        }
    }
}
