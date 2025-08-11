using System.Diagnostics.CodeAnalysis;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Contexts
{
    [ExcludeFromCodeCoverage]
    public class MergeGraylistContext(IMongoDbContext mongoDbContext) : IMergeGraylistContext
    {
        private readonly IMongoDatabase _db = mongoDbContext.Db;

        public IMongoCollection<MergeWordSet> MergeGraylist => _db.GetCollection<MergeWordSet>(
            "MergeGraylistCollection");
    }
}
