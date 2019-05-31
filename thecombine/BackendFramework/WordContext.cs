using BackendFramework.ValueModels;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using static BackendFramework.Startup;
using BackendFramework.Interfaces;
namespace BackendFramework.Context
{

    public class WordContext : IWordContext
    {
        private readonly IMongoDatabase _db;

        public WordContext(IOptions<Settings> options)
        {
            var client = new MongoClient(options.Value.ConnectionString);
            _db = client.GetDatabase(options.Value.Database);
        }

        public IMongoCollection<Word> Words => _db.GetCollection<Word>("Database");
    }
    
}