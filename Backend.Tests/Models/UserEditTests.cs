using BackendFramework.Models;
using NUnit.Framework;

namespace Backend.Tests.Models
{
    public class UserEditTests
    {
        private const string ProjectId = "50000";

        [Test]
        public void TestEquals()
        {

            var edit = new UserEdit { ProjectId = ProjectId };
            Assert.That(edit.Equals(new UserEdit { ProjectId = ProjectId }));
        }

        [Test]
        public void TestEqualsNull()
        {
            var edit = new UserEdit { ProjectId = ProjectId };
            Assert.IsFalse(edit.Equals(null));
        }
    }

    public class EditTests
    {
        private const int GoalType = 1;

        [Test]
        public void TestEquals()
        {

            var edit = new Edit { GoalType = GoalType };
            Assert.That(edit.Equals(new Edit { GoalType = GoalType }));
        }

        [Test]
        public void TestEqualsNull()
        {
            var edit = new Edit { GoalType = GoalType };
            Assert.IsFalse(edit.Equals(null));
        }
    }
}
