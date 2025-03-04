using BackendFramework.Models;
using NUnit.Framework;

namespace Backend.Tests.Models
{
    public class SiteBannerTests
    {
        [Test]
        public void TestNoneType()
        {
            Assert.That(new SiteBanner().Type, Is.EqualTo(BannerType.None));
        }
    }
}
