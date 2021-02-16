using System.Collections.Generic;
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
        private List<string> StepData = new List<string>() { "step" };
        private const string Changes = "{wordIds:[]}";

        [Test]
        public void TestEquals()
        {

            var edit = new Edit { GoalType = GoalType };
            Assert.That(edit.Equals(new Edit { GoalType = GoalType }));
            edit.StepData = StepData;
            Assert.That(edit.Equals(new Edit { GoalType = GoalType, StepData = StepData }));
            edit.Changes = Changes;
            Assert.That(edit.Equals(
                new Edit { GoalType = GoalType, StepData = StepData, Changes = Changes }));

        }

        [Test]
        public void TestEqualsNull()
        {
            var edit = new Edit { GoalType = GoalType };
            Assert.IsFalse(edit.Equals(null));
            edit = new Edit { StepData = StepData };
            Assert.IsFalse(edit.Equals(null));
            edit = new Edit { Changes = Changes };
            Assert.IsFalse(edit.Equals(null));
        }
    }
}
