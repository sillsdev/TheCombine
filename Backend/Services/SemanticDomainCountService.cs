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

        /// <summary> Updates counts when a new word is added </summary>
        public async Task UpdateCountsForWord(Word word)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "updating counts for word");

            foreach (var sense in word.Senses)
            {
                foreach (var domain in sense.SemanticDomains)
                {
                    await _countRepo.Increment(word.ProjectId, domain.Id, 1);
                }
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

                foreach (var sense in word.Senses)
                {
                    foreach (var domain in sense.SemanticDomains)
                    {
                        if (!projectDict.TryGetValue(domain.Id, out _))
                        {
                            projectDict[domain.Id] = 0;
                        }
                        projectDict[domain.Id]++;
                    }
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

            // Get old domains
            var oldDomains = new Dictionary<string, int>();
            foreach (var sense in oldWord.Senses)
            {
                foreach (var domain in sense.SemanticDomains)
                {
                    oldDomains[domain.Id] = oldDomains.GetValueOrDefault(domain.Id, 0) + 1;
                }
            }

            // Get new domains
            var newDomains = new Dictionary<string, int>();
            foreach (var sense in newWord.Senses)
            {
                foreach (var domain in sense.SemanticDomains)
                {
                    newDomains[domain.Id] = newDomains.GetValueOrDefault(domain.Id, 0) + 1;
                }
            }

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
                foreach (var sense in word.Senses)
                {
                    foreach (var domain in sense.SemanticDomains)
                    {
                        domainCounts[domain.Id] = domainCounts.GetValueOrDefault(domain.Id, 0) + 1;
                    }
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
