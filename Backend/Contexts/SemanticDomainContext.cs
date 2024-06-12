using System.Diagnostics.CodeAnalysis;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace BackendFramework.Contexts
{
    [ExcludeFromCodeCoverage]
    public class SemanticDomainContext : ISemanticDomainContext
    {
        private readonly IMongoDatabase _db;

        public SemanticDomainContext(IOptions<Startup.Settings> options)
        {
            var client = new MongoClient(options.Value.ConnectionString);
            _db = client.GetDatabase(options.Value.CombineDatabase);
        }

        public IMongoCollection<DBSemanticDomainTreeNode> SemanticDomains => _db.GetCollection<DBSemanticDomainTreeNode>("SemanticDomainTree");
        public IMongoCollection<DBSemanticDomainFull> FullSemanticDomains => _db.GetCollection<DBSemanticDomainFull>("SemanticDomains");
    }
}
