using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BackendFramework.Services
{
    public class WordRepository : IWordRepository
    {
        private readonly IWordContext _wordDatabase;

        public WordRepository(IWordContext collectionSettings)
        {
            _wordDatabase = collectionSettings;
        }

        public async Task<List<Word>> GetAllWords(string projectId)
        {
            return await _wordDatabase.Words.Find(w => w.ProjectId == projectId).ToListAsync();
        }

        public async Task<Word> GetWord(string projectId, string wordId)
        {
            var filterDef = new FilterDefinitionBuilder<Word>();
            var filter = filterDef.And(filterDef.Eq(x => x.ProjectId, projectId), filterDef.Eq(x => x.Id, wordId));

            var wordList =  await _wordDatabase.Words.FindAsync(filter);

            return wordList.FirstOrDefault();
        }

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

        public async Task<Word> Create(Word word)
        {
            await _wordDatabase.Words.InsertOneAsync(word);
            await AddFrontier(word);
            return word;
        }

        public async Task<Word> Add(Word word)
        {
            await _wordDatabase.Words.InsertOneAsync(word);
            return word;
        }

        public async Task<List<Word>> GetFrontier(string projectId)
        {
            return await _wordDatabase.Frontier.Find(w => w.ProjectId == projectId).ToListAsync();
        }

        public async Task<Word> AddFrontier(Word word)
        {
            await _wordDatabase.Frontier.InsertOneAsync(word);
            return word;
        }

        public async Task<bool> DeleteFrontier(string projectId, string wordId)
        {
            var filterDef = new FilterDefinitionBuilder<Word>();
            var filter = filterDef.And(filterDef.Eq(x => x.ProjectId, projectId), filterDef.Eq(x => x.Id, wordId));

            var deleted = await _wordDatabase.Frontier.DeleteManyAsync(filter);
            return deleted.DeletedCount > 0;
        }
    }
}