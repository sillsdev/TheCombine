using BackendFramework.Models;
using NUnit.Framework;

namespace Backend.Tests.Models
{
    public class SiteBannerTests
    {
        private const string Login = "Login";
        private const string Announcement = "Announcement";
        private readonly SiteBanner _siteBanner = new() { Login = Login, Announcement = Announcement };

        [Test]
        public void TestEquals()
        {
            Assert.That(_siteBanner.Equals(new SiteBanner { Login = Login, Announcement = Announcement }));
        }

        [Test]
        public void TestNotEquals()
        {
            Assert.IsFalse(_siteBanner.Equals(
                new SiteBanner { Login = "Different Login", Announcement = Announcement }));
            Assert.IsFalse(_siteBanner.Equals(
                new SiteBanner { Login = Login, Announcement = "Different Announcement" }));
        }

        [Test]
        public void TestEqualsNull()
        {
            Assert.IsFalse(_siteBanner.Equals(null));
        }

        [Test]
        public void TestHashCode()
        {
            Assert.AreNotEqual(
                _siteBanner.GetHashCode(),
                new SiteBanner { Login = "Different Login", Announcement = Announcement }.GetHashCode());
            Assert.AreNotEqual(
                _siteBanner.GetHashCode(),
                new SiteBanner { Login = Login, Announcement = "Different Announcement" }.GetHashCode());
        }
    }
}
