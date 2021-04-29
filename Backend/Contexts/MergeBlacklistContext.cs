using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using static BackendFramework.Startup;

namespace BackendFramework.Contexts
{
    public class MergeBlacklistContext : IMergeBlacklistContext
    {
        private readonly IMongoDatabase _db;

        public MergeBlacklistContext(IOptions<Settings> options)
        {
            var client = new MongoClient(options.Value.ConnectionString);
            _db = client.GetDatabase(options.Value.CombineDatabase);
        }

        public IMongoCollection<MergeBlacklistEntry> MergeBlacklist => _db.GetCollection<MergeBlacklistEntry>(
            "MergeBlacklistCollection");
    }
}
