using System.Diagnostics.CodeAnalysis;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace BackendFramework.Contexts
{
    [ExcludeFromCodeCoverage]
    public class MergeWordSetContext : IMergeWordSetContext
    {
        private readonly IMongoDatabase _db;

        public MergeWordSetContext(IOptions<Startup.Settings> options)
        {
            var client = new MongoClient(options.Value.ConnectionString);
            _db = client.GetDatabase(options.Value.CombineDatabase);
        }

        public IMongoCollection<MergeWordSetEntry> MergeWordSet => _db.GetCollection<MergeWordSetEntry>(
            "MergeWordSetCollection");
    }
}
