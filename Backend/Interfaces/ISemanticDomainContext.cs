using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Interfaces
{
    public interface ISemanticDomainContext
    {
        IMongoCollection<SemanticDomainTreeNode> SemanticDomains { get; }
        IMongoCollection<SemanticDomainFull> FullSemanticDomains { get; }
    }
}
