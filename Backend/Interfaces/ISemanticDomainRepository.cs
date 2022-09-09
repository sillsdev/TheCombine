using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface ISemanticDomainRepository
    {
        Task<SemanticDomainFull?> GetSemanticDomainFull(string id, string lang);
        Task<SemanticDomainTreeNode?> GetSemanticDomainTreeNode(string id, string lang);
        Task<SemanticDomainTreeNode?> GetSemanticDomainTreeNodeByName(string name, string lang);
    }
}
