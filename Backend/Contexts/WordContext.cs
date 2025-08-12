using System.Diagnostics.CodeAnalysis;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Contexts
{
    [ExcludeFromCodeCoverage]
    public class WordContext(IMongoDbContext mongoDbContext) : IWordContext
    {
        private readonly IMongoDatabase _db = mongoDbContext.Db;

        public IMongoCollection<Word> Words => _db.GetCollection<Word>("WordsCollection");
        public IMongoCollection<Word> Frontier => _db.GetCollection<Word>("FrontierCollection");
    }
}
