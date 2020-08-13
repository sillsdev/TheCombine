using System.Collections.Generic;
using System.Threading.Tasks;
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
        public async Task<Word> GetWord(string projectId, string wordId)
        {
            var filterDef = new FilterDefinitionBuilder<Word>();
            var filter = filterDef.And(filterDef.Eq(
                x => x.ProjectId, projectId), filterDef.Eq(x => x.Id, wordId));

            var wordList = await _wordDatabase.Words.FindAsync(filter);

            return wordList.FirstOrDefault();
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
            if (deleted.DeletedCount != 0)
            {
                return true;
            }
            return false;
        }

        /// <summary> Adds a <see cref="Word"/> to the WordsCollection and Frontier </summary>
        /// <returns> The word created </returns>
        public async Task<Word> Create(Word word)
        {
            await _wordDatabase.Words.InsertOneAsync(word);
            await AddFrontier(word);
            return word;
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
            return await _wordDatabase.Frontier.Find(w => w.ProjectId == projectId && w.Accessibility == (int)State.Active).ToListAsync();
        }

        /// <summary> Finds <see cref="Word"/> in the Frontier for specified id </summary>
        public async Task<Word> GetFrontierWordToDelete(string wordId)
        {
            var result = await _wordDatabase.Frontier.Find(w => w.Id == wordId).ToListAsync();
            return result[0];
        }

        /// <summary> Adds a <see cref="Word"/> only to the Frontier </summary>
        /// <returns> The word created </returns>
        public async Task<Word> AddFrontier(Word word)
        {
            await _wordDatabase.Frontier.InsertOneAsync(word);
            return word;
        }

        /// <summary> Updates a <see cref="Word"/> in the Frontier </summary>
        /// <returns> The word updated </returns>
        public async Task<int> UpdateFrontierWord(Word word)
        {
            var result = await _wordDatabase.Frontier.ReplaceOneAsync(w => w.Id == word.Id, word);
            return (int)result.ModifiedCount;
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
