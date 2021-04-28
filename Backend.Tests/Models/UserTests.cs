using BackendFramework.Models;
using NUnit.Framework;

namespace Backend.Tests.Models
{
    public class UserTests
    {
        private const string Name = "George";

        [Test]
        public void TestEquals()
        {

            var user = new User { Name = Name };
            Assert.That(user.Equals(new User { Name = Name }));
        }

        [Test]
        public void TestEqualsNull()
        {
            var user = new User { Name = Name };
            Assert.IsFalse(user.Equals(null));
        }

        [Test]
        public void TestSanitize()
        {
            var user = new User { Avatar = "ava", Password = "pas", Token = "tok" };
            Assert.IsFalse(user.Equals(new User()));
            user.Sanitize();
            Assert.IsTrue(user.Equals(new User()));
        }
    }
}
