using BackendFramework.Models;
using NUnit.Framework;
using System.Collections.Generic;
using KellermanSoftware.CompareNetObjects;

namespace Backend.Tests.Models
{
    public class MergeUndoIdsTests
    {
        private readonly List<string> _parentIds1 = new() { "parent1", "parent2" };
        private readonly List<string> _parentIds2 = new() { "parent1", "parent2", "parent3" };
        private readonly List<string> _parentIds3 = new() { "parent1", "parent3" };
        private readonly List<string> _childIds1 = new() { "child1", "child2" };
        private readonly List<string> _childIds2 = new() { "child1", "child2", "child3" };
        private readonly List<string> _childIds3 = new() { "child1", "child3" };

        [Test]
        public void TestContentEquals()
        {
            var mergeEmpty = new MergeUndoIds();
            var mergeNonEmpty = new MergeUndoIds { ParentIds = _parentIds1, ChildIds = _childIds1 };

            Assert.That(mergeEmpty.ContentEquals(new MergeUndoIds()));
            Assert.That(mergeNonEmpty.ContentEquals(new MergeUndoIds { ParentIds = _parentIds1, ChildIds = _childIds1 }));
        }

        [Test]
        public void TestCloneEquals()
        {
            var merge = new MergeUndoIds { ParentIds = _parentIds1, ChildIds = _childIds1 };
            merge.ShouldCompare(merge.Clone());
        }

        [Test]
        public void TestNotContentEquals()
        {
            var mergeEmpty = new MergeUndoIds();
            var mergeNonEmpty1 = new MergeUndoIds { ParentIds = _parentIds1, ChildIds = _childIds1 };
            var mergeNonEmpty2 = new MergeUndoIds { ParentIds = _parentIds1, ChildIds = _childIds2 };
            var mergeNonEmpty3 = new MergeUndoIds { ParentIds = _parentIds2, ChildIds = _childIds1 };
            var mergeNonEmpty4 = new MergeUndoIds { ParentIds = _parentIds1, ChildIds = _childIds3 };
            var mergeNonEmpty5 = new MergeUndoIds { ParentIds = _parentIds3, ChildIds = _childIds1 };

            Assert.IsFalse(mergeEmpty.ContentEquals(mergeNonEmpty1));
            // Test one added child.
            Assert.IsFalse(mergeNonEmpty1.ContentEquals(mergeNonEmpty2));
            // Test one added parent.
            Assert.IsFalse(mergeNonEmpty1.ContentEquals(mergeNonEmpty3));
            // Test one different child.
            Assert.IsFalse(mergeNonEmpty1.ContentEquals(mergeNonEmpty4));
            // Test one different parent.
            Assert.IsFalse(mergeNonEmpty1.ContentEquals(mergeNonEmpty5));
        }
    }
}
