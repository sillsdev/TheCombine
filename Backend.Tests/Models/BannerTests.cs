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
            Assert.That(_siteBanner.Equals(new SiteBanner { Type = Type, Text = Text }), Is.True);
        }

        [Test]
        public void TestNotEquals()
        {
            Assert.That(_siteBanner.Equals(
                new SiteBanner { Type = BannerType.Announcement, Text = Text }), Is.False);
            Assert.That(_siteBanner.Equals(
                new SiteBanner { Type = Type, Text = "Different Text" }), Is.False);
        }

        [Test]
        public void TestEqualsNull()
        {
            Assert.That(_siteBanner.Equals(null), Is.False);
        }

        [Test]
        public void TestHashCode()
        {
            Assert.That(
                _siteBanner.GetHashCode(),
                Is.Not.EqualTo(new SiteBanner { Type = BannerType.Announcement, Text = Text }.GetHashCode()));
            Assert.That(
                _siteBanner.GetHashCode(),
                Is.Not.EqualTo(new SiteBanner { Type = Type, Text = "Different Text" }.GetHashCode()));
        }
    }
}
