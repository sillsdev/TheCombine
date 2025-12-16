using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Otel;

namespace BackendFramework.Services
{
    /// <summary> Service for managing semantic domain sense counts </summary>
    public class SemanticDomainCountService : ISemanticDomainCountService
    {
        private readonly ISemanticDomainCountRepository _countRepo;
        private readonly IWordRepository _wordRepo;

        private const string otelTagName = "otel.SemanticDomainCountService";

        public SemanticDomainCountService(
            ISemanticDomainCountRepository countRepo,
            IWordRepository wordRepo)
        {
            _countRepo = countRepo;
            _wordRepo = wordRepo;
        }

        /// <summary> Extracts domain counts from a word </summary>
        private static Dictionary<string, int> GetDomainCounts(Word word)
        {
            var domainCounts = new Dictionary<string, int>();
            foreach (var sense in word.Senses)
            {
                foreach (var domain in sense.SemanticDomains)
                {
                    domainCounts[domain.Id] = domainCounts.GetValueOrDefault(domain.Id, 0) + 1;
                }
            }
            return domainCounts;
        }

        /// <summary> Updates counts when a new word is added </summary>
        public async Task UpdateCountsForWord(Word word)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "updating counts for word");

            var domainCounts = GetDomainCounts(word);
            foreach (var entry in domainCounts)
            {
                await _countRepo.Increment(word.ProjectId, entry.Key, entry.Value);
            }
        }

        /// <summary> Updates counts when multiple new words are added </summary>
        public async Task UpdateCountsForWords(List<Word> words)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "updating counts for words");

            // Group by project and domain for efficient bulk updates
            var domainCounts = new Dictionary<string, Dictionary<string, int>>();

            foreach (var word in words)
            {
                if (!domainCounts.TryGetValue(word.ProjectId, out var projectDict))
                {
                    projectDict = new Dictionary<string, int>();
                    domainCounts[word.ProjectId] = projectDict;
                }

                var wordDomainCounts = GetDomainCounts(word);
                foreach (var entry in wordDomainCounts)
                {
                    projectDict[entry.Key] = projectDict.GetValueOrDefault(entry.Key, 0) + entry.Value;
                }
            }

            // Apply all increments
            foreach (var projectEntry in domainCounts)
            {
                var projectId = projectEntry.Key;
                foreach (var domainEntry in projectEntry.Value)
                {
                    await _countRepo.Increment(projectId, domainEntry.Key, domainEntry.Value);
                }
            }
        }

        /// <summary> Updates counts when a word is modified </summary>
        public async Task UpdateCountsAfterWordUpdate(Word oldWord, Word newWord)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "updating counts after word update");

            var oldDomains = GetDomainCounts(oldWord);
            var newDomains = GetDomainCounts(newWord);

            // Calculate differences
            var allDomainIds = oldDomains.Keys.Union(newDomains.Keys).ToHashSet();
            foreach (var domainId in allDomainIds)
            {
                var oldCount = oldDomains.GetValueOrDefault(domainId, 0);
                var newCount = newDomains.GetValueOrDefault(domainId, 0);
                var diff = newCount - oldCount;

                if (diff != 0)
                {
                    await _countRepo.Increment(newWord.ProjectId, domainId, diff);
                }
            }
        }

        /// <summary> Updates counts when a word is deleted </summary>
        public async Task UpdateCountsForWordDeletion(Word word)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "updating counts for word deletion");

            var domainCounts = GetDomainCounts(word);
            foreach (var entry in domainCounts)
            {
                await _countRepo.Increment(word.ProjectId, entry.Key, -entry.Value);
            }
        }

        /// <summary> Migrates counts for an existing project by scanning all Frontier words </summary>
        public async Task MigrateCounts(string projectId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "migrating counts for project");

            // Clear existing counts for the project
            await _countRepo.DeleteAllCounts(projectId);

            // Get all words in the frontier
            var words = await _wordRepo.GetFrontier(projectId);

            // Build count map
            var domainCounts = new Dictionary<string, int>();
            foreach (var word in words)
            {
                var wordDomainCounts = GetDomainCounts(word);
                foreach (var entry in wordDomainCounts)
                {
                    domainCounts[entry.Key] = domainCounts.GetValueOrDefault(entry.Key, 0) + entry.Value;
                }
            }

            // Create count entries
            foreach (var entry in domainCounts)
            {
                await _countRepo.Create(new ProjectSemanticDomainCount(projectId, entry.Key, entry.Value));
            }
        }
    }
}
