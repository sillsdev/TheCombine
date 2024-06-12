using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Interfaces
{
    public interface ISemanticDomainContext
    {
        IMongoCollection<DBSemanticDomainTreeNode> SemanticDomains { get; }
        IMongoCollection<DBSemanticDomainFull> FullSemanticDomains { get; }
    }
}
