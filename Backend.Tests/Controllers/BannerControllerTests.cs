using Backend.Tests.Mocks;
using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;

namespace Backend.Tests.Controllers
{
    public class BannerControllerTests
    {
        private IBannerRepository _bannerRepo = null!;
        private IPermissionService _permissionService = null!;
        private BannerController _bannerController = null!;

        private const string Announcement = "Announcement";
        private const string Login = "Login";
        private readonly SiteBanner _siteBanner = new() { Announcement = Announcement, Login = Login };

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
            var result = (bool)((ObjectResult)_bannerController.UpdateBanner(_siteBanner).Result).Value;
            Assert.IsTrue(result);
            var banner = (SiteBanner)((ObjectResult)_bannerController.GetBanner().Result).Value;
            Assert.AreEqual(banner, _siteBanner);
        }

        [Test]
        public void TestUpdateBannerNoPermission()
        {
            _bannerController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _bannerController.UpdateBanner(_siteBanner).Result;
            Assert.IsInstanceOf<ForbidResult>(result);
        }

        [Test]
        public void TestGetNoPermission()
        {
            var result = (bool)((ObjectResult)_bannerController.UpdateBanner(_siteBanner).Result).Value;
            Assert.IsTrue(result);
            _bannerController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var banner = (SiteBanner)((ObjectResult)_bannerController.GetBanner().Result).Value;
            Assert.AreEqual(banner, _siteBanner);
        }
    }
}
