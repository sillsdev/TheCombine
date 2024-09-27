using System.Diagnostics.CodeAnalysis;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Contexts
{
    [ExcludeFromCodeCoverage]
    public class MergeGraylistContext : IMergeGraylistContext
    {
        private readonly IMongoDbContext _mongoDbContext;
        public MergeGraylistContext(IMongoDbContext mongoDbContext)
        {
            _mongoDbContext = mongoDbContext;
        }

        public IMongoCollection<MergeWordSet> MergeGraylist => _mongoDbContext.Db.GetCollection<MergeWordSet>(
            "MergeGraylistCollection");
    }
}
