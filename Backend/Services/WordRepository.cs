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

        /// <summary> Adds a <see cref="Word"/> to the WordsCollection and Frontier </summary>
        /// <returns> The word created </returns>
        public async Task<Word> Create(Word word)
        {
            PopulateWordGuids(word);

            // Only update date time stamps if they are blank to allow services such as LiftApiService to set before
            // creation.
            if (word.Created.Length == 0)
            {
                // Use Roundtrip-suitable ISO 8601 format.
                word.Created = Time.UtcNowIso8601();
            }
            if (word.Modified.Length == 0)
            {
                word.Modified = Time.UtcNowIso8601();
            }

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

        /// <summary> Adds a <see cref="Word"/> only to the WordsCollection </summary>
        /// <returns> The word created </returns>
        public async Task<Word> Add(Word word)
        {
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
    }
}
