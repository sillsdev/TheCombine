using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Otel;
using MongoDB.Driver;

namespace BackendFramework.Repositories
{
    /// <summary> Atomic database functions for <see cref="Word"/>s. </summary>
    [ExcludeFromCodeCoverage]
    public class WordRepository : IWordRepository
    {
        private readonly IWordContext _wordDatabase;

        private const string otelTagName = "otel.WordRepository";

        public WordRepository(IWordContext collectionSettings)
        {
            _wordDatabase = collectionSettings;
        }

        /// <summary>
        /// Creates a mongo filter for all words in a specified project (and optionally with specified vernacular).
        /// Since a variant in FLEx can export as an entry without any senses, filters out 0-sense words.
        /// </summary>
        private static FilterDefinition<Word> GetAllProjectWordsFilter(string projectId, string? vernacular = null)
        {
            var filterDef = new FilterDefinitionBuilder<Word>();
            return (vernacular is null)
                ? filterDef.And(filterDef.Eq(w => w.ProjectId, projectId), filterDef.SizeGt(w => w.Senses, 0))
                : filterDef.And(filterDef.Eq(w => w.ProjectId, projectId), filterDef.SizeGt(w => w.Senses, 0),
                    filterDef.Eq(w => w.Vernacular, vernacular));
        }

        /// <summary> Creates a mongo filter for words in a specified project with specified wordId. </summary>
        private static FilterDefinition<Word> GetProjectWordFilter(string projectId, string wordId)
        {
            var filterDef = new FilterDefinitionBuilder<Word>();
            return filterDef.And(filterDef.Eq(w => w.ProjectId, projectId), filterDef.Eq(w => w.Id, wordId));
        }

        /// <summary> Creates a mongo filter for words in a specified project with specified wordIds. </summary>
        private static FilterDefinition<Word> GetProjectWordsFilter(string projectId, List<string> wordIds)
        {
            var filterDef = new FilterDefinitionBuilder<Word>();
            return filterDef.And(filterDef.Eq(w => w.ProjectId, projectId), filterDef.In(w => w.Id, wordIds));
        }

        /// <summary> Finds all <see cref="Word"/>s with specified projectId </summary>
        public async Task<List<Word>> GetAllWords(string projectId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting all words");

            return await _wordDatabase.Words.Find(GetAllProjectWordsFilter(projectId)).ToListAsync();
        }

        /// <summary> Finds <see cref="Word"/> with specified wordId and projectId </summary>
        public async Task<Word?> GetWord(string projectId, string wordId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting a word");

            var wordList = await _wordDatabase.Words.FindAsync(GetProjectWordFilter(projectId, wordId));
            try
            {
                return await wordList.FirstAsync();
            }
            catch (InvalidOperationException)
            {
                return null;
            }
        }

        /// <summary> Removes all <see cref="Word"/>s from the WordsCollection and Frontier for specified
        /// <see cref="Project"/> </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> DeleteAllWords(string projectId)
        {
            using var activity =
                OtelService.StartActivityWithTag(otelTagName, "deleting all words from WordsCollection and Frontier");

            var filterDef = new FilterDefinitionBuilder<Word>();
            var filter = filterDef.Eq(x => x.ProjectId, projectId);

            var deleted = await _wordDatabase.Words.DeleteManyAsync(filter);
            await _wordDatabase.Frontier.DeleteManyAsync(filter);
            return deleted.DeletedCount != 0;
        }

        /// <summary>
        /// If the <see cref="Word"/> Created or Modified times are blank, fill them in the current time.
        /// </summary>
        private static void PopulateBlankWordTimes(Word word)
        {
            if (string.IsNullOrEmpty(word.Created))
            {
                // Use Roundtrip-suitable ISO 8601 format.
                word.Created = Time.UtcNowIso8601();
            }
            if (string.IsNullOrEmpty(word.Modified))
            {
                word.Modified = Time.UtcNowIso8601();
            }
        }

        /// <summary> Adds a <see cref="Word"/> to the WordsCollection and Frontier </summary>
        /// <remarks>
        /// If the Created or Modified time fields are blank, they will automatically calculated using the current
        /// time. This allows services to set or clear the values before creation to control these fields.
        /// </remarks>
        /// <param name="word"></param>
        /// <returns> The word created </returns>
        public async Task<Word> Create(Word word)
        {
            using var activity =
                OtelService.StartActivityWithTag(otelTagName, "creating a word in WordsCollection and Frontier");

            PopulateBlankWordTimes(word);
            await _wordDatabase.Words.InsertOneAsync(word);
            await AddFrontier(word);
            return word;
        }

        /// <summary> Adds a list of <see cref="Word"/>s to the WordsCollection and Frontier </summary>
        /// <remarks>
        /// If the Created or Modified time fields are blank, they will automatically calculated using the current
        /// time. This allows services to set or clear the values before creation to control these fields.
        /// </remarks>
        /// <param name="words"></param>
        /// <returns> The words created </returns>
        public async Task<List<Word>> Create(List<Word> words)
        {
            using var activity =
                OtelService.StartActivityWithTag(otelTagName, "creating words in WordsCollection and Frontier");

            if (words.Count == 0)
            {
                return words;
            }
            foreach (var w in words)
            {
                PopulateBlankWordTimes(w);
            }
            await _wordDatabase.Words.InsertManyAsync(words);
            await AddFrontier(words);
            return words;
        }

        /// <summary> Adds a <see cref="Word"/> only to the WordsCollection </summary>
        /// <remarks>
        /// If the Created or Modified time fields are blank, they will automatically calculated using the current
        /// time. This allows services to set or clear the values before creation to control these fields.
        /// </remarks>
        /// <returns> The word created </returns>
        public async Task<Word> Add(Word word)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "adding a word to WordsCollection");

            PopulateBlankWordTimes(word);
            await _wordDatabase.Words.InsertOneAsync(word);
            return word;
        }

        /// <summary> Checks if Words collection for specified <see cref="Project"/> has any words. </summary>
        public async Task<bool> HasWords(string projectId)
        {
            using var activity =
                OtelService.StartActivityWithTag(otelTagName, "checking if WordsCollection has words");

            return await _wordDatabase.Words.Find(GetAllProjectWordsFilter(projectId)).Limit(1).AnyAsync();
        }

        /// <summary> Checks if Frontier for specified <see cref="Project"/> has any words. </summary>
        public async Task<bool> HasFrontierWords(string projectId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "checking if Frontier has words");

            return await _wordDatabase.Frontier.Find(GetAllProjectWordsFilter(projectId)).Limit(1).AnyAsync();
        }

        /// <summary> Checks if specified word is in Frontier for specified <see cref="Project"/> </summary>
        public async Task<bool> IsInFrontier(string projectId, string wordId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "checking if Frontier contains a word");

            return (await _wordDatabase.Frontier.CountDocumentsAsync(GetProjectWordFilter(projectId, wordId))) > 0;
        }

        /// <summary> Finds all <see cref="Word"/>s in the Frontier for specified <see cref="Project"/> </summary>
        public async Task<List<Word>> GetFrontier(string projectId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting all Frontier words");

            return await _wordDatabase.Frontier.Find(GetAllProjectWordsFilter(projectId)).ToListAsync();
        }

        /// <summary> Finds all <see cref="Word"/>s in Frontier of specified project with specified vern </summary>
        public async Task<List<Word>> GetFrontierWithVernacular(string projectId, string vernacular)
        {
            using var activity =
                OtelService.StartActivityWithTag(otelTagName, "getting all words from Frontier with vern");

            return await _wordDatabase.Frontier.Find(GetAllProjectWordsFilter(projectId, vernacular)).ToListAsync();
        }

        /// <summary> Adds a <see cref="Word"/> only to the Frontier </summary>
        /// <param name="word"></param>
        /// <returns> The word created </returns>
        public async Task<Word> AddFrontier(Word word)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "adding a word to Frontier");

            await _wordDatabase.Frontier.InsertOneAsync(word);
            return word;
        }

        /// <summary> Adds a list of <see cref="Word"/>s only to the Frontier </summary>
        /// <param name="words"></param>
        /// <returns> The words created </returns>
        public async Task<List<Word>> AddFrontier(List<Word> words)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "adding words to Frontier");

            await _wordDatabase.Frontier.InsertManyAsync(words);
            return words;
        }

        /// <summary> Removes <see cref="Word"/> from the Frontier with specified wordId and projectId </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> DeleteFrontier(string projectId, string wordId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "deleting a word from Frontier");

            var deleted = await _wordDatabase.Frontier.DeleteOneAsync(GetProjectWordFilter(projectId, wordId));
            return deleted.DeletedCount > 0;
        }

        /// <summary> Removes <see cref="Word"/>s from the Frontier with specified wordIds and projectId </summary>
        /// <returns> Number of words deleted </returns>
        public async Task<long> DeleteFrontier(string projectId, List<string> wordIds)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "deleting words from Frontier");

            var deleted = await _wordDatabase.Frontier.DeleteManyAsync(GetProjectWordsFilter(projectId, wordIds));
            return deleted.DeletedCount;
        }
    }
}
