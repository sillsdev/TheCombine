using System.Diagnostics.CodeAnalysis;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Contexts
{
    [ExcludeFromCodeCoverage]
    public class SpeakerContext : ISpeakerContext
    {
        private readonly IMongoDbContext _mongoDbContext;
        
        public SpeakerContext(IMongoDbContext mongoDbContext)
        {
            _mongoDbContext = mongoDbContext;
        }

        public IMongoCollection<Speaker> Speakers => _mongoDbContext.Db.GetCollection<Speaker>("SpeakersCollection");
    }
}
