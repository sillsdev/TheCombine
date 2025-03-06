using System;
using BackendFramework.Models;
using NUnit.Framework;

namespace Backend.Tests.Models
{
    public class UserEditTests
    {
        [Test]
        public void TestClone()
        {
            var edit = new UserEdit { Edits = [new() { StepData = ["datum"] }], Id = "ue-id", ProjectId = "proj-id", };
            Assert.That(edit.Clone(), Is.EqualTo(edit).UsingPropertiesComparer());
        }
    }

    public class UserEditStepWrapperTests
    {
        [Test]
        public void TestConstructorStepIndexIsNull()
        {
            var wrapper = new UserEditStepWrapper(Guid.NewGuid(), "step-string");
            Assert.That(wrapper.StepIndex, Is.Null);
        }
    }

    public class EditTests
    {
        [Test]
        public void TestClone()
        {
            var edit = new Edit { Changes = "{wordIds:[]}", GoalType = 1, Guid = Guid.NewGuid(), StepData = ["step"] };
            Assert.That(edit.Clone(), Is.EqualTo(edit).UsingPropertiesComparer());
        }
    }
}
