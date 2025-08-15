using BackendFramework.Models;
using NUnit.Framework;

namespace Backend.Tests.Models
{
    internal sealed class UserRoleTests
    {
        private const string Id = "one";
        private const string ProjectId = "first";
        private const Role Role1 = Role.Harvester;
        private const Role Role2 = Role.Editor;

        [Test]
        public void TestClone()
        {
            var userRole = new UserRole { Id = Id, ProjectId = ProjectId, Role = Role1 };
            Assert.That(userRole.Clone(), Is.EqualTo(userRole).UsingPropertiesComparer());
        }
    }

    internal sealed class ProjectRoleTests
    {
        [Test]
        public void TestClone()
        {
            var projectRole = new ProjectRole { ProjectId = "proj-id", Role = Role.Editor };
            Assert.That(projectRole.Clone(), Is.EqualTo(projectRole).UsingPropertiesComparer());
        }
    }
}
