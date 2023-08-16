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
            Assert.That(user.Equals(new User { Name = Name }), Is.True);
        }

        [Test]
        public void TestEqualsNull()
        {
            var user = new User { Name = Name };
            Assert.That(user.Equals(null), Is.False);
        }

        [Test]
        public void TestHashCode()
        {
            Assert.That(
                new User { Name = Name }.GetHashCode(),
                Is.Not.EqualTo(new User { Name = "Different Name" }.GetHashCode())
            );
        }

        [Test]
        public void TestSanitize()
        {
            var user = new User { Avatar = "ava", Password = "pas", Token = "tok" };
            Assert.That(user.Equals(new User()), Is.False);
            user.Sanitize();
            Assert.That(user.Equals(new User()), Is.True);
        }
    }

    public class CredentialsTest
    {
        [Test]
        public void TestConstructor()
        {
            var credentials = new Credentials();
            Assert.That(credentials.Username, Is.EqualTo(""));
            Assert.That(credentials.Password, Is.EqualTo(""));
        }
    }
}
