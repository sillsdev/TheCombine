using System.Diagnostics.CodeAnalysis;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Contexts
{
    [ExcludeFromCodeCoverage]
    public class MergeBlacklistContext : IMergeBlacklistContext
    {
        private readonly IMongoDbContext _mongoDbContext;
        public MergeBlacklistContext(IMongoDbContext mongoDbContext)
        {
            _mongoDbContext = mongoDbContext;
        }

        public IMongoCollection<MergeWordSet> MergeBlacklist => _mongoDbContext.Db.GetCollection<MergeWordSet>(
            "MergeBlacklistCollection");
    }
}
