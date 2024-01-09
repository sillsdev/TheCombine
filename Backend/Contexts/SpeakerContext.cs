using System.Diagnostics.CodeAnalysis;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace BackendFramework.Contexts
{
    [ExcludeFromCodeCoverage]
    public class SpeakerContext : ISpeakerContext
    {
        private readonly IMongoDatabase _db;

        public SpeakerContext(IOptions<Startup.Settings> options)
        {
            var client = new MongoClient(options.Value.ConnectionString);
            _db = client.GetDatabase(options.Value.CombineDatabase);
        }

        public IMongoCollection<Speaker> Speakers => _db.GetCollection<Speaker>("SpeakersCollection");
    }
}
