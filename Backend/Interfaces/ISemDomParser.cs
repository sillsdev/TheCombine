using BackendFramework.ValueModels;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BackendFramework.Interfaces
{
    public interface ISemDomParser
    {
        Task<List<SemanticDomainWithSubdomains>> ParseSemanticDomains(string projectId);
    }
}
