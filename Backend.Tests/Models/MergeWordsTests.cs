using System;
using BackendFramework.Models;
using NUnit.Framework;
using System.Collections.Generic;

namespace Backend.Tests.Models
{
    public class MergeUndoIdsTests
    {
        List<string> parentIds1 = new List<string> { "parent1", "parent2" };
        List<string> parentIds2 = new List<string> { "parent1", "parent2", "parent3" };
        List<string> childIds1 = new List<string> { "child1", "child2" };
        List<string> childIds2 = new List<string> { "child1", "child2", "child3" };

        [Test]
        public void TestEquals()
        {
            var mergeEmpty = new MergeUndoIds();
            var mergeNonEmpty = new MergeUndoIds { ParentIds = parentIds1, ChildIds = childIds1 };

            Assert.That(mergeEmpty.Equals(new MergeUndoIds()));
            Assert.That(mergeNonEmpty.Equals(new MergeUndoIds { ParentIds = parentIds1, ChildIds = childIds1 }));
        }

        [Test]
        public void TestNotEquals()
        {
            var mergeEmpty = new MergeUndoIds();
            var mergeNonEmpty1 = new MergeUndoIds { ParentIds = parentIds1, ChildIds = childIds1 };
            var mergeNonEmpty2 = new MergeUndoIds { ParentIds = parentIds2, ChildIds = childIds2 };
            var mergeNonEmpty3 = new MergeUndoIds { ParentIds = parentIds1, ChildIds = childIds2 };
            var mergeNonEmpty4 = new MergeUndoIds { ParentIds = parentIds2, ChildIds = childIds1 };

            Assert.IsFalse(mergeEmpty.Equals(mergeNonEmpty1));
            Assert.IsFalse(mergeNonEmpty1.Equals(mergeNonEmpty2));
            Assert.IsFalse(mergeNonEmpty1.Equals(mergeNonEmpty3));
            Assert.IsFalse(mergeNonEmpty1.Equals(mergeNonEmpty4));
        }

        [Test]
        public void TestEqualsNull()
        {
            var mergeEmpty = new MergeUndoIds();
            var mergeNonEmpty = new MergeUndoIds { ParentIds = parentIds1, ChildIds = childIds1 };

            Assert.IsFalse(mergeEmpty.Equals(null));
            Assert.IsFalse(mergeNonEmpty.Equals(null));
        }

        [Test]
        public void TestHashCode()
        {
            Assert.AreEqual(
                new MergeUndoIds { ParentIds = parentIds1, ChildIds = childIds1 }.GetHashCode(),
                new MergeUndoIds { ParentIds = parentIds1, ChildIds = childIds1 }.GetHashCode());
        }
    }
}