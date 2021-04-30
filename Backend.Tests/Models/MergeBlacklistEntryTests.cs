using System.Collections.Generic;
using BackendFramework.Models;
using NUnit.Framework;

namespace Backend.Tests.Models
{
    public class MergeBlacklistEntryTests
    {
        private const string EntryId = "MergeBlacklistEntryTestId";
        private const string ProjId = "MergeBlacklistEntryTestProjectId";
        private const string UserId = "MergeBlacklistEntryTestUserId";
        private readonly List<string> wordIds = new List<string> { "word1", "word2" };
        private readonly List<string> idsRevd = new List<string> { "word2", "word1" };

        [Test]
        public void TestClone()
        {
            var entryA = new MergeBlacklistEntry
            {
                Id = EntryId,
                ProjectId = ProjId,
                UserId = UserId,
                WordIds = wordIds
            };
            var entryB = entryA.Clone();
            Assert.That(entryA.Equals(entryB));
        }

        [Test]
        public void TestEquals()
        {
            var entryA = new MergeBlacklistEntry
            {
                Id = EntryId,
                ProjectId = ProjId,
                UserId = UserId,
                WordIds = wordIds
            };
            var entryB = new MergeBlacklistEntry
            {
                Id = EntryId,
                ProjectId = ProjId,
                UserId = UserId,
                WordIds = idsRevd
            };
            Assert.That(entryA.Equals(entryB));
        }

        [Test]
        public void TestEqualsFalse()
        {
            var entryA = new MergeBlacklistEntry();
            var entryB = new MergeBlacklistEntry();
            entryA.Id = EntryId;
            Assert.IsFalse(entryA.Equals(entryB));

            entryB = entryA.Clone();
            entryA.ProjectId = ProjId;
            Assert.IsFalse(entryA.Equals(entryB));

            entryB = entryA.Clone();
            entryA.UserId = UserId;
            Assert.IsFalse(entryA.Equals(entryB));

            entryB = entryA.Clone();
            entryA.WordIds = wordIds;
            Assert.IsFalse(entryA.Equals(entryB));
        }

        [Test]
        public void TestEqualsNull()
        {
            var edit = new MergeBlacklistEntry { ProjectId = ProjId };
            Assert.IsFalse(edit.Equals(null));
        }
    }
}
