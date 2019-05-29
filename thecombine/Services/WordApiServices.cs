/* Mark Fuller
 * Mongo to c# api. 
 */

using System.Collections.Generic;
using System.Linq;
using BackendFramework.ValueModels;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using BackendFramework.Context;
using BackendFramework.Services;
using System.Threading.Tasks;
using BackendFramework.WordService;
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
      
        async Task<IEnumerable<Word>> IWordService.GetAllWords()
        {
            return await _wordDatabase.Words.Find(_ => true).ToListAsync();
        }

        async Task<Word> IWordService.GetWord(string identificaton)
        {
            return new Word();
        }

        async Task IWordService.Create(Word word)
        {
            await _wordDatabase.Words.InsertOneAsync(word);
            
           // var document = _wordDatabase.Words.FindSync({ "gloss": word.Gloss, "vernacular": word.Vernacular });
        }

        async Task<bool> IWordService.Delete(string Id)
        {
            throw new System.NotImplementedException();
        }



        public async Task<bool> Update(string Id)
        {
            FilterDefinition<Word> filter = Builders<Word>.Filter.Eq(m => m.Id, Id );

            DeleteResult deleteResult = await _wordDatabase.Words.DeleteOneAsync(filter);

            return deleteResult.IsAcknowledged && deleteResult.DeletedCount > 0;
        }
    }

    
}