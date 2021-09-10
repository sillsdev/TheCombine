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
            var siteBanner = new SiteBanner { Announcement = Announcement, Login = Login };
            var result = (bool)((ObjectResult)_bannerController.UpdateBanner(siteBanner).Result).Value;
            Assert.IsTrue(result);
            var banner = (SiteBanner)((ObjectResult)(_bannerController.GetBanner().Result)).Value;
            Assert.AreEqual(banner, siteBanner);
        }
    }
}
