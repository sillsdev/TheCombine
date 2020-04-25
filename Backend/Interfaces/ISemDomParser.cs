using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface ISemDomParser
    {
        Task<List<SemanticDomainWithSubdomains>> ParseSemanticDomains(string projectId);
    }
}
