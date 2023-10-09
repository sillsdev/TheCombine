using System.Diagnostics.CodeAnalysis;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace BackendFramework.Contexts
{
    [ExcludeFromCodeCoverage]
    public class MergeGraylistContext : IMergeGraylistContext
    {
        private readonly IMongoDatabase _db;

        public MergeGraylistContext(IOptions<Startup.Settings> options)
        {
            var client = new MongoClient(options.Value.ConnectionString);
            _db = client.GetDatabase(options.Value.CombineDatabase);
        }

        public IMongoCollection<MergeWordSet> MergeGraylist => _db.GetCollection<MergeWordSet>(
            "MergeGraylistCollection");
    }
}
