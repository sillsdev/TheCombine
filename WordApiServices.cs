/* Mark Fuller
 * Mongo to c# api. 
 */

using System.Collections.Generic;
using System.Linq;
using BooksApi.Models;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using BackendFramework.IWordContext;

namespace BackendFramework.Services
{
    public class WordService : IWordService
    {



        private readonly IMongoCollection<Word> _langCollection;
        /*
        public Service(IConfiguration config)
        {
            var client = new MongoClient(config.GetSection("MongoDB:ConnectionString"));
            var database = client.GetSection("MongoDB:Database"); 
            _langCollection = database.GetCollection<Word>(database);
        }
        */

       


        public List<Word> Get()
        {
            return _langCollection.Find(word => true).ToList();
        }

        public Word Get(string id)
        {
            return _langCollection.Find<Word>(word => word.Id == id).FirstOrDefault();
        }

        public Word Create(Word word)
        {
            _langCollection.InsertOne(word);
            return word;
        }

        public void Update(string id, Word wordIn)
        {
            _langCollection.ReplaceOne(word => word.Id == id, wordIn);
        }

        public void Remove(Word wordIn)
        {
            _langCollection.DeleteOne(word => word.Id == wordIn.Id);
        }

        public void Remove(string id)
        {
            _langCollection.DeleteOne(word => word.Id == id);
        }
    }
}