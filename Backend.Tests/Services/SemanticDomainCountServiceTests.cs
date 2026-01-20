using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Tests.Mocks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Services;
using NUnit.Framework;

namespace Backend.Tests.Services
{
    internal sealed class SemanticDomainCountServiceTests
    {
        private ISemanticDomainCountRepository _countRepo = null!;
        private ISemanticDomainCountService _countService = null!;

        private const string ProjId = "CountServiceTestProjId";
        private const string DomainId1 = "1.1";
        private const string DomainId2 = "2.1";

        [SetUp]
        public void Setup()
        {
            _countRepo = new SemanticDomainCountRepositoryMock();
            _countService = new SemanticDomainCountService(_countRepo);
        }

        [Test]
        public async Task TestUpdateCountsForWord()
        {
            var word = new Word
            {
                ProjectId = ProjId,
                Senses = [new() { SemanticDomains = [new() { Id = DomainId1 }, new() { Id = DomainId2 }] }],
            };

            await _countService.UpdateCountsForWord(word);

            var count1 = await _countRepo.GetCount(ProjId, DomainId1);
            var count2 = await _countRepo.GetCount(ProjId, DomainId2);

            Assert.That(count1, Is.EqualTo(1));
            Assert.That(count2, Is.EqualTo(1));
        }

        [Test]
        public async Task TestUpdateCountsForWords()
        {
            var words = new List<Word>
            {
                new()
                {
                    ProjectId = ProjId,
                    Senses = [new() { SemanticDomains = [new() { Id = DomainId1 }] }]
                },
                new()
                {
                    ProjectId = ProjId,
                    Senses = [new() { SemanticDomains = [new() { Id = DomainId1 }, new() { Id = DomainId2 }] }],
                }
            };

            await _countService.UpdateCountsForWords(words);

            var count1 = await _countRepo.GetCount(ProjId, DomainId1);
            var count2 = await _countRepo.GetCount(ProjId, DomainId2);

            Assert.That(count1, Is.EqualTo(2));
            Assert.That(count2, Is.EqualTo(1));
        }

        [Test]
        public async Task TestUpdateCountsAfterWordUpdate()
        {
            var oldWord = new Word
            {
                ProjectId = ProjId,
                Senses = [new() { SemanticDomains = [new() { Id = DomainId1 }, new() { Id = DomainId2 }] }],
            };

            var newWord = new Word
            {
                ProjectId = ProjId,
                Senses = [new() { SemanticDomains = [new() { Id = DomainId1 }] }]
            };

            // Start with counts from old word
            await _countService.UpdateCountsForWord(oldWord);

            // Update counts
            await _countService.UpdateCountsAfterWordUpdate(oldWord, newWord);

            var count1 = await _countRepo.GetCount(ProjId, DomainId1);
            var count2 = await _countRepo.GetCount(ProjId, DomainId2);

            Assert.That(count1, Is.EqualTo(1)); // Unchanged
            Assert.That(count2, Is.EqualTo(0)); // Decremented by 1
        }

        [Test]
        public async Task TestUpdateCountsForWordDeletion()
        {
            var word = new Word
            {
                ProjectId = ProjId,
                Senses = [new() { SemanticDomains = [new() { Id = DomainId1 }, new() { Id = DomainId2 }] }],
            };

            // First add the word to get initial counts
            await _countService.UpdateCountsForWord(word);

            var count1Before = await _countRepo.GetCount(ProjId, DomainId1);
            var count2Before = await _countRepo.GetCount(ProjId, DomainId2);
            Assert.That(count1Before, Is.EqualTo(1));
            Assert.That(count2Before, Is.EqualTo(1));

            // Now delete it
            await _countService.UpdateCountsForWordDeletion(word);

            var count1After = await _countRepo.GetCount(ProjId, DomainId1);
            var count2After = await _countRepo.GetCount(ProjId, DomainId2);
            Assert.That(count1After, Is.EqualTo(0));
            Assert.That(count2After, Is.EqualTo(0));
        }
    }
}
