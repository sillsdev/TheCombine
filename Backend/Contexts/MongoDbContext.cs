using System;
using System.Diagnostics.CodeAnalysis;
using BackendFramework.Interfaces;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace BackendFramework.Contexts
{
    [ExcludeFromCodeCoverage]
    public class MongoDbContext : IMongoDbContext
    {
        private MongoClient _mongoClient { get; }

        public IMongoDatabase Db { get; }

        public MongoDbContext(IOptions<Startup.Settings> options)
        {
            _mongoClient = new MongoClient(options.Value.ConnectionString);
            Db = _mongoClient.GetDatabase(options.Value.CombineDatabase);
        }

        public void Dispose()
        {
            _mongoClient.Dispose();
            GC.SuppressFinalize(this);
        }
    }
}
