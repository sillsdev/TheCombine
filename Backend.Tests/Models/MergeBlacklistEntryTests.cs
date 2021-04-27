using System.Collections.Generic;
using BackendFramework.Models;
using NUnit.Framework;

namespace Backend.Tests.Models
{
    public class MergeBlacklistEntryTests
    {
        private const string id = "EntryId";
        private const string projId = "ProjId";
        private const string userId = "UserId";
        private List<string> wordIds = new List<string> { "word1", "word2" };
        private List<string> idsRevd = new List<string> { "word2", "word1" };

        [Test]
        public void TestClone()
        {
            var entryA = new MergeBlacklistEntry();
            var entryB = entryA.Clone();
            Assert.That(entryA.Equals(entryB));

            entryA.Id = id;
            Assert.IsFalse(entryA.Equals(entryB));
            entryB = entryA.Clone();
            Assert.That(entryA.Equals(entryB));

            entryA.ProjectId = projId;
            Assert.IsFalse(entryA.Equals(entryB));
            entryB = entryA.Clone();
            Assert.That(entryA.Equals(entryB));

            entryA.UserId = userId;
            Assert.IsFalse(entryA.Equals(entryB));
            entryB = entryA.Clone();
            Assert.That(entryA.Equals(entryB));

            entryA.WordIds = wordIds;
            Assert.IsFalse(entryA.Equals(entryB));
            entryB = entryA.Clone();
            Assert.That(entryA.Equals(entryB));
        }

        [Test]
        public void TestEquals()
        {
            var entryA = new MergeBlacklistEntry { Id = id, ProjectId = projId, UserId = userId, WordIds = wordIds };
            var entryB = new MergeBlacklistEntry { Id = id, ProjectId = projId, UserId = userId, WordIds = idsRevd };
            Assert.That(entryA.Equals(entryB));
        }

        [Test]
        public void TestEqualsNull()
        {
            var edit = new MergeBlacklistEntry { ProjectId = projId };
            Assert.IsFalse(edit.Equals(null));
        }
    }
}
