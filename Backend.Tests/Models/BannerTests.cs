using BackendFramework.Models;
using NUnit.Framework;

namespace Backend.Tests.Models
{
    internal sealed class SiteBannerTests
    {
        [Test]
        public void TestConstructorTypeIsNone()
        {
            Assert.That(new SiteBanner().Type, Is.EqualTo(BannerType.None));
        }
    }
}
