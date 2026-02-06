using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Otel;

namespace BackendFramework.Services
{
    /// <summary> Service for managing semantic domain sense counts </summary>
    public class SemanticDomainCountService(ISemanticDomainCountRepository semDomCountRepo) : ISemanticDomainCountService
    {
        private readonly ISemanticDomainCountRepository _semDomCountRepo = semDomCountRepo;

        private const string otelTagName = "otel.SemanticDomainCountService";

        /// <summary> Extracts domain counts from a word </summary>
        private static Dictionary<string, int> GetDomainCounts(Word word, Dictionary<string, int>? domainCounts = null)
        {
            domainCounts ??= [];
            foreach (var sense in word.Senses)
            {
                foreach (var domain in sense.SemanticDomains)
                {
                    domainCounts[domain.Id] = domainCounts.GetValueOrDefault(domain.Id, 0) + 1;
                }
            }
            return domainCounts;
        }

        /// <summary> Clears all counts for a project </summary>
        public async Task ClearCountsForProject(string projectId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "clearing counts for project");

            await _semDomCountRepo.DeleteAllCounts(projectId);
        }

        /// <summary> Updates counts when a new word is added </summary>
        public async Task UpdateCountsForWord(Word word)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "updating counts for word");

            var domainCounts = GetDomainCounts(word);
            foreach (var entry in domainCounts)
            {
                await _semDomCountRepo.Increment(word.ProjectId, entry.Key, entry.Value);
            }
        }

        /// <summary> Updates counts when multiple new words are added </summary>
        public async Task UpdateCountsForWords(List<Word> words)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "updating counts for words");

            if (words.Count == 0)
            {
                return;
            }

            var domainCounts = new Dictionary<string, Dictionary<string, int>>();
            foreach (var word in words)
            {
                if (!domainCounts.TryGetValue(word.ProjectId, out var projectDomainCounts))
                {
                    projectDomainCounts = [];
                    domainCounts[word.ProjectId] = projectDomainCounts;
                }
                GetDomainCounts(word, projectDomainCounts);
            }

            foreach (var projectEntry in domainCounts)
            {
                foreach (var domainEntry in projectEntry.Value)
                {
                    await _semDomCountRepo.Increment(projectEntry.Key, domainEntry.Key, domainEntry.Value);
                }
            }
        }

        /// <summary> Updates counts when a word is modified </summary>
        public async Task UpdateCountsAfterWordUpdate(Word oldWord, Word newWord)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "updating counts after word update");

            if (oldWord.ProjectId != newWord.ProjectId)
            {
                throw new System.ArgumentException("Old and new words must belong to the same project");
            }

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
                    await _semDomCountRepo.Increment(newWord.ProjectId, domainId, diff);
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
                await _semDomCountRepo.Increment(word.ProjectId, entry.Key, -entry.Value);
            }
        }
    }
}
