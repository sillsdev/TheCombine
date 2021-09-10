using System;
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
        public void TestNotEquals()
        {
            var edit = new UserEdit { ProjectId = ProjectId };
            Assert.IsFalse(edit.Equals(new UserEdit { ProjectId = "Different Id" }));
        }

        [Test]
        public void TestEqualsNull()
        {
            var edit = new UserEdit { ProjectId = ProjectId };
            Assert.IsFalse(edit.Equals(null));
        }

        [Test]
        public void TestHashCode()
        {
            Assert.AreNotEqual(
                new UserEdit { ProjectId = ProjectId }.GetHashCode(),
                new UserEdit { ProjectId = "Different Id" }.GetHashCode());
        }
    }

    public class UserEditStepWrapperTests
    {
        private const int GoalIndex = 1;
        private const string StepString = "step";
        private const int StepIndex = 1;

        [Test]
        public void TestEquals()
        {
            var wrapper = new UserEditStepWrapper(GoalIndex, StepString, StepIndex);
            Assert.That(wrapper.Equals(new UserEditStepWrapper(GoalIndex, StepString, StepIndex)));
            Assert.IsFalse(wrapper.Equals(new UserEditStepWrapper(99, StepString, StepIndex)));
            Assert.IsFalse(wrapper.Equals(new UserEditStepWrapper(GoalIndex, "Different step", StepIndex)));
            Assert.IsFalse(wrapper.Equals(new UserEditStepWrapper(GoalIndex, StepString, 99)));
            Assert.IsFalse(wrapper.Equals(null));
        }

        [Test]
        public void TestHashCode()
        {
            Assert.AreNotEqual(new UserEditStepWrapper(GoalIndex, StepString, StepIndex).GetHashCode(),
                new UserEditStepWrapper(99, StepString, StepIndex).GetHashCode());
        }
    }

    public class EditTests
    {
        private const int GoalType = 1;
        private readonly Guid _guid = Guid.NewGuid();
        private readonly List<string> _stepData = new() { "step" };
        private const string Changes = "{wordIds:[]}";

        [Test]
        public void TestEquals()
        {
            var edit = new Edit { Guid = _guid };
            Assert.That(edit.Equals(new Edit { Guid = _guid }));
            edit.GoalType = GoalType;
            Assert.That(edit.Equals(new Edit { Guid = _guid, GoalType = GoalType }));
            edit.StepData = _stepData;
            Assert.That(edit.Equals(
                new Edit { GoalType = GoalType, Guid = _guid, StepData = _stepData }));
            edit.Changes = Changes;
            Assert.That(edit.Equals(
                new Edit { GoalType = GoalType, Guid = _guid, StepData = _stepData, Changes = Changes }));

        }

        [Test]
        public void TestEqualsNull()
        {
            var edit = new Edit();
            Assert.IsFalse(edit.Equals(null));
            edit = new Edit { GoalType = GoalType };
            Assert.IsFalse(edit.Equals(null));
            edit = new Edit { StepData = _stepData };
            Assert.IsFalse(edit.Equals(null));
            edit = new Edit { Changes = Changes };
            Assert.IsFalse(edit.Equals(null));
        }

        [Test]
        public void TestHashCode()
        {
            Assert.AreNotEqual(
                new Edit { Guid = _guid, GoalType = GoalType }.GetHashCode(),
                new Edit { Guid = _guid, GoalType = 5 }.GetHashCode());
        }
    }
}
