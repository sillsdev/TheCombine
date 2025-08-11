using System.Diagnostics.CodeAnalysis;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Contexts
{
    [ExcludeFromCodeCoverage]
    public class MergeBlacklistContext(IMongoDbContext mongoDbContext) : IMergeBlacklistContext
    {
        private readonly IMongoDatabase _db = mongoDbContext.Db;

        public IMongoCollection<MergeWordSet> MergeBlacklist => _db.GetCollection<MergeWordSet>(
            "MergeBlacklistCollection");
    }
}
