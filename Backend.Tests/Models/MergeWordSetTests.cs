using System.Collections.Generic;
using BackendFramework.Models;
using NUnit.Framework;

namespace Backend.Tests.Models
{
    public class MergeWordSetTests
    {
        private const string EntryId = "MergeWordSetTestId";
        private const string ProjId = "MergeWordSetTestProjectId";
        private const string UserId = "MergeWordSetTestUserId";
        private readonly List<string> _wordIds = ["word1", "word2"];
        private readonly List<string> _wordIdsReversed = ["word2", "word1"];

        [Test]
        public void TestClone()
        {
            var entry = new MergeWordSet
            {
                Id = EntryId,
                ProjectId = ProjId,
                UserId = UserId,
                WordIds = _wordIds
            };
            Assert.That(entry.Clone(), Is.EqualTo(entry).UsingPropertiesComparer());
        }

        [Test]
        public void TestContentEqualsTrue()
        {
            var entryA = new MergeWordSet
            {
                Id = EntryId,
                ProjectId = ProjId,
                UserId = UserId,
                WordIds = _wordIds
            };
            var entryB = new MergeWordSet
            {
                Id = "different id",
                ProjectId = ProjId,
                UserId = UserId,
                WordIds = _wordIdsReversed
            };
            Assert.That(entryA, Is.Not.EqualTo(entryB).UsingPropertiesComparer());
            Assert.That(entryA.ContentEquals(entryB), Is.True);
        }

        [Test]
        public void TestContentEqualsFalse()
        {
            var entryA = new MergeWordSet();
            var entryB = new MergeWordSet();
            entryA.ProjectId = ProjId;
            Assert.That(entryA.ContentEquals(entryB), Is.False);

            entryB = entryA.Clone();
            entryA.UserId = UserId;
            Assert.That(entryA.ContentEquals(entryB), Is.False);

            entryB = entryA.Clone();
            entryA.WordIds = _wordIds;
            Assert.That(entryA.ContentEquals(entryB), Is.False);
        }
    }
}
