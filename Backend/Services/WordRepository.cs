using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Services
{
    /// <summary> Atomic database functions for <see cref="Word"/>s </summary>
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
            var filter = filterDef.And(filterDef.Eq(
                x => x.ProjectId, projectId), filterDef.Eq(x => x.Id, wordId));

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
        /// <returns> The word created </returns>
        public async Task<Word> Create(Word word)
        {
            PopulateWordGuids(word);
            PopulateBlankWordTimes(word);
            await _wordDatabase.Words.InsertOneAsync(word);
            await AddFrontier(word);
            return word;
        }

        /// <remarks> This method should be removed once all legacy data has been converted. </remarks>
        internal static void PopulateWordGuids(Word word)
        {
            if (word.Guid is null || Guid.Empty.Equals(word.Guid))
            {
                word.Guid = Guid.NewGuid();
            }

            foreach (var sense in word.Senses)
            {
                if (sense.Guid is null || Guid.Empty.Equals(sense.Guid))
                {
                    sense.Guid = Guid.NewGuid();
                }
            }
        }

        /// <remarks> This method should be removed once all legacy data has been converted. </remarks>
        private async Task<bool> PopulateGuidsAndUpdateWord(Word word, Guid? guid = null)
        {
            if ((word.Guid is null || Guid.Empty.Equals(word.Guid)) && guid != null)
            {
                word.Guid = guid;
            }
            PopulateWordGuids(word);
            return await UpdateWord(word);
        }

        /// <remarks> This method should be removed once all legacy data has been converted. </remarks>
        private async Task<bool> PopulateGuidInHistory(Word word)
        {
            PopulateWordGuids(word);
            var idsToUpdate = new List<string>(word.History) { word.Id };
            var success = true;
            foreach (var priorId in idsToUpdate)
            {
                var priorWord = await GetWord(word.ProjectId, priorId);
                if (priorWord != null)
                {
                    success &= await PopulateGuidsAndUpdateWord(priorWord, word.Guid);
                }
            }
            return success;
        }

        /// <remarks> This method should be removed once all legacy data has been converted. </remarks>
        public async Task<bool> PopulateAllGuids()
        {
            var success = true;

            // Update frontier words and their predecessors.
            var frontierWords = await _wordDatabase.Frontier.Find(w => true).ToListAsync();
            foreach (var w in frontierWords)
            {
                success &= await PopulateGuidInHistory(w);
                success &= await UpdateFrontier(w);
            }

            // Update deleted words and their predecessors.
            // Note: this could error if a deleted word has another deleted word in its history.
            var deletedWords = await _wordDatabase.Words.Find(w => w.Accessibility == State.Deleted).ToListAsync();
            foreach (var w in deletedWords)
            {
                success &= await PopulateGuidInHistory(w);
            }

            // Catch stragglers.
            var allWords = await _wordDatabase.Words.Find(w => true).ToListAsync();
            foreach (var w in allWords)
            {
                success &= await PopulateGuidsAndUpdateWord(w);
            }

            return success;
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

        /// <summary> Finds all <see cref="Word"/>s in the Frontier for specified <see cref="Project"/> </summary>
        public async Task<List<Word>> GetFrontier(string projectId)
        {
            return await _wordDatabase.Frontier.Find(w => w.ProjectId == projectId).ToListAsync();
        }

        /// <summary> Adds a <see cref="Word"/> only to the Frontier </summary>
        /// <returns> The word created </returns>
        public async Task<Word> AddFrontier(Word word)
        {
            await _wordDatabase.Frontier.InsertOneAsync(word);
            return word;
        }

        /// <summary> Removes <see cref="Word"/> from the Frontier with specified wordId and projectId </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> DeleteFrontier(string projectId, string wordId)
        {
            var filterDef = new FilterDefinitionBuilder<Word>();
            var filter = filterDef.And(filterDef.Eq(
                x => x.ProjectId, projectId), filterDef.Eq(x => x.Id, wordId));

            var deleted = await _wordDatabase.Frontier.DeleteOneAsync(filter);
            return deleted.DeletedCount > 0;
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
