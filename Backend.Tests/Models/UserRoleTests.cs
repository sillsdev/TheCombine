using BackendFramework.Models;
using NUnit.Framework;

namespace Backend.Tests.Models
{
    public class UserRoleTests
    {
        private const string ProjectId = "50000";

        [Test]
        public void TestEquals()
        {
            var role = new UserRole { ProjectId = ProjectId };
            Assert.That(role.Equals(new UserRole { ProjectId = ProjectId }));
        }

        [Test]
        public void TestNotEquals()
        {
            var role = new UserRole { ProjectId = ProjectId };
            Assert.IsFalse(role.Equals(new UserRole { ProjectId = "Different ID" }));
        }

        [Test]
        public void TestEqualsNull()
        {
            var role = new UserRole { ProjectId = ProjectId };
            Assert.IsFalse(role.Equals(null));
        }

        [Test]
        public void TestGetHashCode()
        {
            Assert.AreNotEqual(
                new UserRole { ProjectId = ProjectId }.GetHashCode(),
                new UserRole { ProjectId = "Different ID" }.GetHashCode());
        }
    }
}
