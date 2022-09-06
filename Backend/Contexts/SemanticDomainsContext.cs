using System.Diagnostics.CodeAnalysis;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace BackendFramework.Contexts
{
    [ExcludeFromCodeCoverage]
    public class SemanticDomainsContext : ISemanticDomainsContext
    {
        private readonly IMongoDatabase _db;

        public SemanticDomainsContext(IOptions<Startup.Settings> options)
        {
            var client = new MongoClient(options.Value.ConnectionString);
            _db = client.GetDatabase(options.Value.CombineDatabase);
        }

        public IMongoCollection<SemanticDomainTreeNode> SemanticDomains => _db.GetCollection<SemanticDomainTreeNode>("SemanticDomainsTree");
        public IMongoCollection<SemanticDomainFull> FullSemanticDomains => _db.GetCollection<SemanticDomainFull>("SemanticDomains");
    }
}

// Get Context and Model connected to DB, Update SemanticDomainService to access the context to provide what the Controller needs
// Add all the IOC bits
// ???
// Profit!