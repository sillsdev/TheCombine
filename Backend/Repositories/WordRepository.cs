using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Repositories
{
    /// <summary> Atomic database functions for <see cref="Word"/>s </summary>
    [ExcludeFromCodeCoverage]
    public class WordRepository : IWordRepository
    {
        private readonly IWordContext _wordDatabase;

        public WordRepository(IWordContext collectionSettings)
        {
            _wordDatabase = collectionSettings;
        }

        /// <summary>  Finds all <see cref="Word"/>s with specified projectId </summary>
        public async Task<List<Word>> GetAllWords(string projectId)
        {
            return await _wordDatabase.Words.Find(w => w.ProjectId == projectId).ToListAsync();
        }

        /// <summary> Finds <see cref="Word"/> with specified wordId and projectId </summary>
        public async Task<Word?> GetWord(string projectId, string wordId)
        {
            var filterDef = new FilterDefinitionBuilder<Word>();
            var filter = filterDef.And(
                filterDef.Eq(x => x.ProjectId, projectId),
                filterDef.Eq(x => x.Id, wordId));

            var wordList = await _wordDatabase.Words.FindAsync(filter);
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
            PopulateBlankWordTimes(word);
            await _wordDatabase.Words.InsertOneAsync(word);
            return word;
        }

        /// <summary> Checks if Frontier is nonempty for specified <see cref="Project"/> </summary>
        public async Task<bool> IsFrontierNonempty(string projectId)
        {
            var word = await _wordDatabase.Frontier.Find(w => w.ProjectId == projectId).FirstOrDefaultAsync();
            return word is not null;
        }

        /// <summary> Finds all <see cref="Word"/>s in the Frontier for specified <see cref="Project"/> </summary>
        public async Task<List<Word>> GetFrontier(string projectId)
        {
            return await _wordDatabase.Frontier.Find(w => w.ProjectId == projectId).ToListAsync();
        }

        /// <summary> Adds a <see cref="Word"/> only to the Frontier </summary>
        /// <param name="word"></param>
        /// <returns> The word created </returns>
        public async Task<Word> AddFrontier(Word word)
        {
            await _wordDatabase.Frontier.InsertOneAsync(word);
            return word;
        }

        /// <summary> Adds a list of <see cref="Word"/>s only to the Frontier </summary>
        /// <param name="words"></param>
        /// <returns> The words created </returns>
        public async Task<List<Word>> AddFrontier(List<Word> words)
        {
            await _wordDatabase.Frontier.InsertManyAsync(words);
            return words;
        }

        /// <summary> Removes <see cref="Word"/> from the Frontier with specified wordId and projectId </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> DeleteFrontier(string projectId, string wordId)
        {
            var filterDef = new FilterDefinitionBuilder<Word>();
            var filter = filterDef.And(
                filterDef.Eq(x => x.ProjectId, projectId),
                filterDef.Eq(x => x.Id, wordId));

            var deleted = await _wordDatabase.Frontier.DeleteOneAsync(filter);
            return deleted.DeletedCount > 0;
        }

        /// <summary> Removes <see cref="Word"/>s from the Frontier with specified wordIds and projectId </summary>
        /// <returns> Number of words deleted </returns>
        public async Task<long> DeleteFrontier(string projectId, List<string> wordIds)
        {
            var filterDef = new FilterDefinitionBuilder<Word>();
            var filter = filterDef.And(
                filterDef.Eq(x => x.ProjectId, projectId),
                filterDef.In(x => x.Id, wordIds));
            var deleted = await _wordDatabase.Frontier.DeleteManyAsync(filter);
            return deleted.DeletedCount;
        }

        /// <summary> Updates <see cref="Word"/> in the Frontier collection with same wordId and projectId </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> UpdateFrontier(Word word)
        {
            var filterDef = new FilterDefinitionBuilder<Word>();
            var filter = filterDef.And(
                filterDef.Eq(x => x.ProjectId, word.ProjectId),
                filterDef.Eq(x => x.Id, word.Id));

            var deleted = (await _wordDatabase.Frontier.DeleteOneAsync(filter)).DeletedCount > 0;
            if (deleted)
            {
                await AddFrontier(word);
            }
            return deleted;
        }

        /// <summary> Updates <see cref="Word"/> in the Words collection with same wordId and projectId </summary>
        /// <returns> A bool: success of operation </returns>
        private async Task<bool> UpdateWord(Word word)
        {
            var filterDef = new FilterDefinitionBuilder<Word>();
            var filter = filterDef.And(
                filterDef.Eq(x => x.ProjectId, word.ProjectId),
                filterDef.Eq(x => x.Id, word.Id));

            var deleted = (await _wordDatabase.Words.DeleteOneAsync(filter)).DeletedCount > 0;
            if (deleted)
            {
                await Add(word);
            }
            return deleted;
        }
    }
}
