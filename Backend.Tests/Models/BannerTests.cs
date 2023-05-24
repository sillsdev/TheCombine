using BackendFramework.Models;
using NUnit.Framework;

namespace Backend.Tests.Models
{
    public class SiteBannerTests
    {
        private const BannerType Type = BannerType.Login;
        private const string Text = "Login Banner Text";
        private readonly SiteBanner _siteBanner = new() { Type = Type, Text = Text };

        [Test]
        public void TestEquals()
        {
            Assert.That(_siteBanner.Equals(new SiteBanner { Type = Type, Text = Text }));
        }

        [Test]
        public void TestNotEquals()
        {
            Assert.IsFalse(_siteBanner.Equals(
                new SiteBanner { Type = BannerType.Announcement, Text = Text }));
            Assert.IsFalse(_siteBanner.Equals(
                new SiteBanner { Type = Type, Text = "Different Text" }));
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
                new SiteBanner { Type = BannerType.Announcement, Text = Text }.GetHashCode());
            Assert.AreNotEqual(
                _siteBanner.GetHashCode(),
                new SiteBanner { Type = Type, Text = "Different Text" }.GetHashCode());
        }
    }
}
