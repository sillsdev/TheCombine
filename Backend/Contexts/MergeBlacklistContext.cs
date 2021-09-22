using System.Diagnostics.CodeAnalysis;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace BackendFramework.Contexts
{
    [ExcludeFromCodeCoverage]
    public class MergeBlacklistContext : IMergeBlacklistContext
    {
        private readonly IMongoDatabase _db;

        public MergeBlacklistContext(IOptions<Startup.Settings> options)
        {
            var client = new MongoClient(options.Value.ConnectionString);
            _db = client.GetDatabase(options.Value.CombineDatabase);
        }

        public IMongoCollection<MergeBlacklistEntry> MergeBlacklist => _db.GetCollection<MergeBlacklistEntry>(
            "MergeBlacklistCollection");
    }
}
