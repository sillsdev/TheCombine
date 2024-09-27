using System.Diagnostics.CodeAnalysis;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Contexts
{
    [ExcludeFromCodeCoverage]
    public class WordContext : IWordContext
    {
        private readonly IMongoDbContext _mongoDbContext;
        public WordContext(IMongoDbContext mongoDbContext)
        {
            _mongoDbContext = mongoDbContext;
        }

        public IMongoCollection<Word> Words => _mongoDbContext.Db.GetCollection<Word>("WordsCollection");
        public IMongoCollection<Word> Frontier => _mongoDbContext.Db.GetCollection<Word>("FrontierCollection");
    }
}
