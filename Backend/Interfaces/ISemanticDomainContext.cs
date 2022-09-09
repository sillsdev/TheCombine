using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Interfaces
{
    public interface ISemanticDomainContext
    {
        public IMongoCollection<SemanticDomainTreeNode> SemanticDomains { get; }
        public IMongoCollection<SemanticDomainFull> FullSemanticDomains { get; }
    }
}
