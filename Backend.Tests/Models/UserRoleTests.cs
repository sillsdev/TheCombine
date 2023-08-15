using BackendFramework.Models;
using NUnit.Framework;

namespace Backend.Tests.Models
{
    public class UserRoleTests
    {
        private const string Id1 = "one";
        private const string Id2 = "two";
        private const string ProjectId1 = "first";
        private const string ProjectId2 = "second";
        private const Role Role1 = Role.Harvester;
        private const Role Role2 = Role.Editor;

        [Test]
        public void TestCloneEquals()
        {
            var userRole = new UserRole { Id = Id1, ProjectId = ProjectId1, Role = Role1 };
            Assert.That(userRole, Is.EqualTo(userRole.Clone()));
        }

        [Test]
        public void TestNotEquals()
        {
            var userRole = new UserRole { Id = Id1, ProjectId = ProjectId1, Role = Role1 };
            Assert.That(userRole, Is.Not.EqualTo(new UserRole { Id = Id2, ProjectId = ProjectId1, Role = Role1 }));
            Assert.That(userRole, Is.Not.EqualTo(new UserRole { Id = Id1, ProjectId = ProjectId2, Role = Role1 }));
            Assert.That(userRole, Is.Not.EqualTo(new UserRole { Id = Id1, ProjectId = ProjectId1, Role = Role2 }));
        }

        [Test]
        public void TestEqualsNull()
        {
            Assert.That(new UserRole().Equals(null), Is.False);
        }

        [Test]
        public void TestGetHashCode()
        {
            Assert.That(
                new UserRole { Id = Id1 }.GetHashCode(),
                Is.Not.EqualTo(new UserRole { Id = Id2 }.GetHashCode()));
            Assert.That(
                new UserRole { ProjectId = ProjectId1 }.GetHashCode(),
                Is.Not.EqualTo(new UserRole { ProjectId = ProjectId2 }.GetHashCode()));
            Assert.That(
                new UserRole { Role = Role1 }.GetHashCode(),
                Is.Not.EqualTo(new UserRole { Role = Role2 }.GetHashCode()));
        }
    }
    public class ProjectRoleTests
    {
        private const string ProjectId1 = "first";
        private const string ProjectId2 = "second";
        private const Role Role1 = Role.Harvester;
        private const Role Role2 = Role.Editor;

        [Test]
        public void TestCloneEquals()
        {
            var projectRole = new ProjectRole { ProjectId = ProjectId1, Role = Role1 };
            Assert.That(projectRole, Is.EqualTo(projectRole.Clone()));
        }

        [Test]
        public void TestNotEquals()
        {
            var projectRole = new ProjectRole { ProjectId = ProjectId1, Role = Role1 };
            Assert.That(projectRole, Is.Not.EqualTo(new ProjectRole { ProjectId = ProjectId2, Role = Role1 }));
            Assert.That(projectRole, Is.Not.EqualTo(new ProjectRole { ProjectId = ProjectId1, Role = Role2 }));
        }

        [Test]
        public void TestEqualsNull()
        {
            Assert.That(new ProjectRole().Equals(null), Is.False);
        }

        [Test]
        public void TestGetHashCode()
        {
            Assert.That(
                new ProjectRole { ProjectId = ProjectId1 }.GetHashCode(),
                Is.Not.EqualTo(new ProjectRole { ProjectId = ProjectId2 }.GetHashCode()));
            Assert.That(
                new ProjectRole { Role = Role1 }.GetHashCode(),
                Is.Not.EqualTo(new ProjectRole { Role = Role2 }.GetHashCode()));
        }
    }
}
