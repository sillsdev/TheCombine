using System.Diagnostics.CodeAnalysis;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Contexts
{
    [ExcludeFromCodeCoverage]
    public class SemanticDomainContext(IMongoDbContext mongoDbContext) : ISemanticDomainContext
    {
        private readonly IMongoDatabase _db = mongoDbContext.Db;

        public IMongoCollection<SemanticDomainTreeNode> SemanticDomains => _db.GetCollection<SemanticDomainTreeNode>(
            "SemanticDomainTree");
        public IMongoCollection<SemanticDomainFull> FullSemanticDomains => _db.GetCollection<SemanticDomainFull>(
            "SemanticDomains");
    }
}
