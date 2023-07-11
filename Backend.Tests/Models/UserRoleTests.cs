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
            Assert.AreEqual(userRole, userRole.Clone());
        }

        [Test]
        public void TestNotEquals()
        {
            var userRole = new UserRole { Id = Id1, ProjectId = ProjectId1, Role = Role1 };
            Assert.AreNotEqual(userRole, new UserRole { Id = Id2, ProjectId = ProjectId1, Role = Role1 });
            Assert.AreNotEqual(userRole, new UserRole { Id = Id1, ProjectId = ProjectId2, Role = Role1 });
            Assert.AreNotEqual(userRole, new UserRole { Id = Id1, ProjectId = ProjectId1, Role = Role2 });
        }

        [Test]
        public void TestEqualsNull()
        {
            Assert.AreNotEqual(new UserRole(), null);
        }

        [Test]
        public void TestGetHashCode()
        {
            Assert.AreNotEqual(
                new UserRole { Id = Id1 }.GetHashCode(),
                new UserRole { Id = Id2 }.GetHashCode());
            Assert.AreNotEqual(
                new UserRole { ProjectId = ProjectId1 }.GetHashCode(),
                new UserRole { ProjectId = ProjectId2 }.GetHashCode());
            Assert.AreNotEqual(
                new UserRole { Role = Role1 }.GetHashCode(),
                new UserRole { Role = Role2 }.GetHashCode());
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
            Assert.AreEqual(projectRole, projectRole.Clone());
        }

        [Test]
        public void TestNotEquals()
        {
            var projectRole = new ProjectRole { ProjectId = ProjectId1, Role = Role1 };
            Assert.AreNotEqual(projectRole, new ProjectRole { ProjectId = ProjectId2, Role = Role1 });
            Assert.AreNotEqual(projectRole, new ProjectRole { ProjectId = ProjectId1, Role = Role2 });
        }

        [Test]
        public void TestEqualsNull()
        {
            Assert.AreNotEqual(new ProjectRole(), null);
        }

        [Test]
        public void TestGetHashCode()
        {
            Assert.AreNotEqual(
                new ProjectRole { ProjectId = ProjectId1 }.GetHashCode(),
                new ProjectRole { ProjectId = ProjectId2 }.GetHashCode());
            Assert.AreNotEqual(
                new ProjectRole { Role = Role1 }.GetHashCode(),
                new ProjectRole { Role = Role2 }.GetHashCode());
        }
    }
}
