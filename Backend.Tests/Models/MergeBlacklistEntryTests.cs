using System.Collections.Generic;
using BackendFramework.Models;
using KellermanSoftware.CompareNetObjects;
using NUnit.Framework;

namespace Backend.Tests.Models
{
    public class MergeBlacklistEntryTests
    {
        private const string EntryId = "MergeBlacklistEntryTestId";
        private const string ProjId = "MergeBlacklistEntryTestProjectId";
        private const string UserId = "MergeBlacklistEntryTestUserId";
        private readonly List<string> _wordIds = new() { "word1", "word2" };
        private readonly List<string> _wordIdsReversed = new() { "word2", "word1" };

        [Test]
        public void TestClone()
        {
            var entryA = new MergeBlacklistEntry
            {
                Id = EntryId,
                ProjectId = ProjId,
                UserId = UserId,
                WordIds = _wordIds
            };
            var entryB = entryA.Clone();
            entryA.ShouldCompare(entryB);
        }

        [Test]
        public void TestContentEquals()
        {
            var entryA = new MergeBlacklistEntry
            {
                Id = EntryId,
                ProjectId = ProjId,
                UserId = UserId,
                WordIds = _wordIds
            };
            var entryB = new MergeBlacklistEntry
            {
                Id = EntryId,
                ProjectId = ProjId,
                UserId = UserId,
                WordIds = _wordIdsReversed
            };
            Assert.That(entryA.ContentEquals(entryB));
        }
    }
}
