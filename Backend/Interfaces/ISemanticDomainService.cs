using System.Collections.Generic;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface ISemanticDomainService
    {
        List<SemanticDomainWithSubdomains> ParseSemanticDomains(Project proj);
    }
}
