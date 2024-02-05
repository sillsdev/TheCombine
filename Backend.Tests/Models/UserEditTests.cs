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
            Assert.That(edit.Equals(new UserEdit { ProjectId = ProjectId }), Is.True);
        }

        [Test]
        public void TestNotEquals()
        {
            var edit = new UserEdit { ProjectId = ProjectId };
            Assert.That(edit.Equals(new UserEdit { ProjectId = "Different Id" }), Is.False);
        }

        [Test]
        public void TestEqualsNull()
        {
            var edit = new UserEdit { ProjectId = ProjectId };
            Assert.That(edit.Equals(null), Is.False);
        }

        [Test]
        public void TestHashCode()
        {
            Assert.That(
                new UserEdit { ProjectId = ProjectId }.GetHashCode(),
                Is.Not.EqualTo(new UserEdit { ProjectId = "Different Id" }.GetHashCode()));
        }
    }

    public class UserEditStepWrapperTests
    {
        private readonly Guid EditGuid = Guid.NewGuid();
        private const string StepString = "step";
        private const int StepIndex = 1;

        [Test]
        public void TestEquals()
        {
            var wrapper = new UserEditStepWrapper(EditGuid, StepString, StepIndex);
            Assert.That(wrapper.Equals(new UserEditStepWrapper(EditGuid, StepString, StepIndex)), Is.True);
            Assert.That(wrapper.Equals(new UserEditStepWrapper(Guid.NewGuid(), StepString, StepIndex)), Is.False);
            Assert.That(wrapper.Equals(new UserEditStepWrapper(EditGuid, "Different step", StepIndex)), Is.False);
            Assert.That(wrapper.Equals(new UserEditStepWrapper(EditGuid, StepString, 99)), Is.False);
            Assert.That(wrapper.Equals(null), Is.False);
        }

        [Test]
        public void TestHashCode()
        {
            var code = new UserEditStepWrapper(EditGuid, StepString, StepIndex).GetHashCode();
            Assert.That(code,
                Is.Not.EqualTo(new UserEditStepWrapper(Guid.NewGuid(), StepString, StepIndex).GetHashCode()));
            Assert.That(code,
                Is.Not.EqualTo(new UserEditStepWrapper(EditGuid, "Different step", StepIndex).GetHashCode()));
            Assert.That(code, Is.Not.EqualTo(new UserEditStepWrapper(EditGuid, StepString, 99).GetHashCode()));
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
            Assert.That(edit.Equals(new Edit { Guid = _guid }), Is.True);
            edit.GoalType = GoalType;
            Assert.That(edit.Equals(new Edit { Guid = _guid, GoalType = GoalType }), Is.True);
            edit.StepData = _stepData;
            Assert.That(edit.Equals(
                new Edit { GoalType = GoalType, Guid = _guid, StepData = _stepData }), Is.True);
            edit.Changes = Changes;
            Assert.That(edit.Equals(
                new Edit { GoalType = GoalType, Guid = _guid, StepData = _stepData, Changes = Changes }), Is.True);

        }

        [Test]
        public void TestEqualsNull()
        {
            var edit = new Edit();
            Assert.That(edit.Equals(null), Is.False);
            edit = new Edit { GoalType = GoalType };
            Assert.That(edit.Equals(null), Is.False);
            edit = new Edit { StepData = _stepData };
            Assert.That(edit.Equals(null), Is.False);
            edit = new Edit { Changes = Changes };
            Assert.That(edit.Equals(null), Is.False);
        }

        [Test]
        public void TestHashCode()
        {
            Assert.That(
                new Edit { Guid = _guid, GoalType = GoalType }.GetHashCode(),
                Is.Not.EqualTo(new Edit { Guid = _guid, GoalType = 5 }.GetHashCode()));
        }
    }
}
