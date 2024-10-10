using System.Diagnostics.CodeAnalysis;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Contexts
{
    [ExcludeFromCodeCoverage]
    public class SemanticDomainContext : ISemanticDomainContext
    {
        private readonly IMongoDbContext _mongoDbContext;
        public SemanticDomainContext(IMongoDbContext mongoDbContext)
        {
            _mongoDbContext = mongoDbContext;
        }

        public IMongoCollection<SemanticDomainTreeNode> SemanticDomains => _mongoDbContext.Db.GetCollection<SemanticDomainTreeNode>("SemanticDomainTree");
        public IMongoCollection<SemanticDomainFull> FullSemanticDomains => _mongoDbContext.Db.GetCollection<SemanticDomainFull>("SemanticDomains");
    }
}
