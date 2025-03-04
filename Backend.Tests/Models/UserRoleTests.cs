using BackendFramework.Models;
using NUnit.Framework;

namespace Backend.Tests.Models
{
    public class UserRoleTests
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

        [Test]
        public void TestContentEquals()
        {
            var userRole = new UserRole { Id = Id, ProjectId = ProjectId, Role = Role1 };

            // Id not covered in ContentEquals.
            Assert.That(new UserRole { Id = "diff-ur-id", ProjectId = ProjectId, Role = Role1 }
                .ContentEquals(userRole), Is.True);

            // Everything else covered in ContentEquals.
            Assert.That(new UserRole { Id = Id, ProjectId = "diff-proj-id", Role = Role1 }
                .ContentEquals(userRole), Is.False);
            Assert.That(new UserRole { Id = Id, ProjectId = ProjectId, Role = Role2 }
                .ContentEquals(userRole), Is.False);
        }
    }

    public class ProjectRoleTests
    {
        [Test]
        public void TestClone()
        {
            var projectRole = new ProjectRole { ProjectId = "proj-id", Role = Role.Editor };
            Assert.That(projectRole.Clone(), Is.EqualTo(projectRole).UsingPropertiesComparer());
        }
    }
}
