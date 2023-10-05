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
        private readonly List<string> _wordIds = new() { "word1", "word2" };
        private readonly List<string> _wordIdsReversed = new() { "word2", "word1" };

        [Test]
        public void TestClone()
        {
            var entryA = new MergeWordSet
            {
                Id = EntryId,
                ProjectId = ProjId,
                UserId = UserId,
                WordIds = _wordIds
            };
            var entryB = entryA.Clone();
            Assert.That(entryA.Equals(entryB), Is.True);
        }

        [Test]
        public void TestEquals()
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
                Id = EntryId,
                ProjectId = ProjId,
                UserId = UserId,
                WordIds = _wordIdsReversed
            };
            Assert.That(entryA.Equals(entryB), Is.True);
        }

        [Test]
        public void TestEqualsFalse()
        {
            var entryA = new MergeWordSet();
            var entryB = new MergeWordSet();
            entryA.Id = EntryId;
            Assert.That(entryA.Equals(entryB), Is.False);

            entryB = entryA.Clone();
            entryA.ProjectId = ProjId;
            Assert.That(entryA.Equals(entryB), Is.False);

            entryB = entryA.Clone();
            entryA.UserId = UserId;
            Assert.That(entryA.Equals(entryB), Is.False);

            entryB = entryA.Clone();
            entryA.WordIds = _wordIds;
            Assert.That(entryA.Equals(entryB), Is.False);
        }

        [Test]
        public void TestEqualsNull()
        {
            var edit = new MergeWordSet { ProjectId = ProjId };
            Assert.That(edit.Equals(null), Is.False);
        }

        [Test]
        public void TestHashCode()
        {
            var entryA = new MergeWordSet
            {
                Id = EntryId,
                ProjectId = ProjId,
                UserId = UserId,
                WordIds = _wordIdsReversed
            };
            var entryB = new MergeWordSet
            {
                Id = "DifferentTestId",
                ProjectId = ProjId,
                UserId = UserId,
                WordIds = _wordIdsReversed
            };
            Assert.That(entryA.GetHashCode(), Is.Not.EqualTo(entryB.GetHashCode()));
        }
    }
}
