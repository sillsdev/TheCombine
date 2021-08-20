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
        public void TestHashCode()
        {
            Assert.AreNotEqual(
                new User { Name = Name }.GetHashCode(),
                new User { Name = "Different Name" }.GetHashCode()
            );
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

    public class CredentialsTest
    {
        [Test]
        public void TestConstructor()
        {
            var credentials = new Credentials();
            Assert.AreEqual(credentials.Username, "");
            Assert.AreEqual(credentials.Password, "");
        }
    }
}
