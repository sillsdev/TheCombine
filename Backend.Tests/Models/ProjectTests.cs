using BackendFramework.Models;
using NUnit.Framework;

namespace Backend.Tests.Models
{
    public class ProjectTests
    {
        private const string Name = "Project 1";

        [Test]
        public void TestEquals()
        {

            var project = new Project { Name = Name };
            Assert.That(project.Equals(new Project { Name = Name }));
        }

        [Test]
        public void TestEqualsNull()
        {
            var project = new Project { Name = Name };
            Assert.IsFalse(project.Equals(null));
        }
    }
}
