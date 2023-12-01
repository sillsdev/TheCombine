using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;

namespace Backend.Tests.Mocks
{
    public class SemanticDomainRepositoryMock : ISemanticDomainRepository
    {
        private object? _responseObj;
        private List<string>? _validLangs;

        public Task<List<SemanticDomainTreeNode>?> GetAllSemanticDomainTreeNodes(string lang)
        {
            if (_validLangs is null)
            {
                return Task.FromResult((List<SemanticDomainTreeNode>?)_responseObj);
            }

            List<SemanticDomainTreeNode>? semDoms = null;
            if (_validLangs.Contains(lang))
            {
                semDoms = new() { new(new SemanticDomain { Lang = lang }) };
            }
            return Task.FromResult(semDoms);
        }

        public Task<SemanticDomainFull?> GetSemanticDomainFull(string id, string lang)
        {
            return Task.FromResult((SemanticDomainFull?)_responseObj);
        }

        public Task<SemanticDomainTreeNode?> GetSemanticDomainTreeNode(string id, string lang)
        {
            return Task.FromResult((SemanticDomainTreeNode?)_responseObj);
        }

        public Task<SemanticDomainTreeNode?> GetSemanticDomainTreeNodeByName(string name, string lang)
        {
            return Task.FromResult((SemanticDomainTreeNode?)_responseObj);
        }

        internal void SetNextResponse(object? response)
        {
            _responseObj = response;
        }

        internal void SetValidLangs(List<string>? validLangs)
        {
            _validLangs = validLangs;
        }
    }
}
