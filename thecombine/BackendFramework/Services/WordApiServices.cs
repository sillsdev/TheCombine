/* Mark Fuller
 * Mongo to c# api. 
 */

using System.Collections.Generic;
using System.Linq;
using BackendFramework.ValueModels;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using BackendFramework.Context;
using System.Threading.Tasks;
using BackendFramework.Services;
using MongoDB.Bson;
using System;

namespace BackendFramework.Services
{
   

    public class WordService : IWordService
    {

        private readonly IWordContext _wordDatabase;

        public WordService(IWordContext collectionSettings)
        {
            _wordDatabase = collectionSettings;
        }
      
        async Task<List<Word>> IWordService.GetAllWords()
        {
            return await _wordDatabase.Words.Find(_ => true).ToListAsync();
        }

        async Task<List<Word>> IWordService.GetWord(string identificaton)
        {
            var cursor = await _wordDatabase.Words.FindAsync(x => x.Id == identificaton);
            return cursor.ToList();
        }

        async Task IWordService.Create(Word word)
        {
            await _wordDatabase.Words.InsertOneAsync(word);
            
        }

        async Task<bool> IWordService.Delete(string Id)
        {
            var deleted = await _wordDatabase.Words.DeleteOneAsync(Id);
            return deleted.DeletedCount > 0;

        }



        public async Task<bool> Update(string Id)
        {
            FilterDefinition<Word> filter = Builders<Word>.Filter.Eq(m => m.Id, Id );

            DeleteResult deleteResult = await _wordDatabase.Words.DeleteOneAsync(filter);

            return deleteResult.IsAcknowledged && deleteResult.DeletedCount > 0;
        }
    }

    
}