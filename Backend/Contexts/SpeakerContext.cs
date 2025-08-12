using System.Diagnostics.CodeAnalysis;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Contexts
{
    [ExcludeFromCodeCoverage]
    public class SpeakerContext(IMongoDbContext mongoDbContext) : ISpeakerContext
    {
        private readonly IMongoDatabase _db = mongoDbContext.Db;

        public IMongoCollection<Speaker> Speakers => _db.GetCollection<Speaker>("SpeakersCollection");
    }
}
