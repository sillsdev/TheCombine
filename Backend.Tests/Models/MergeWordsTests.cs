using BackendFramework.Models;
using NUnit.Framework;

namespace Backend.Tests.Models
{
    public class MergeUndoIdsTests
    {
        [Test]
        public void TestClone()
        {
            var merge = new MergeUndoIds { ParentIds = ["parent1", "parent2"], ChildIds = ["child1", "child2"] };
            Assert.That(merge.Clone(), Is.EqualTo(merge).UsingPropertiesComparer());
        }
    }
}
