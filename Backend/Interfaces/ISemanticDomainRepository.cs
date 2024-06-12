using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface ISemanticDomainRepository
    {
        Task<DBSemanticDomainFull?> GetSemanticDomainFull(string id, string lang);
        Task<DBSemanticDomainTreeNode?> GetSemanticDomainTreeNode(string id, string lang);
        Task<DBSemanticDomainTreeNode?> GetSemanticDomainTreeNodeByName(string name, string lang);
        Task<List<DBSemanticDomainTreeNode>?> GetAllSemanticDomainTreeNodes(string lang);
    }
}
