using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;

namespace Backend.Tests.Mocks
{
    sealed internal class SemanticDomainRepositoryMock : ISemanticDomainRepository
    {
        private object? _responseObj;

        public Task<List<DBSemanticDomainTreeNode>?> GetAllSemanticDomainTreeNodes(string lang)
        {
            return Task.FromResult((List<DBSemanticDomainTreeNode>?)_responseObj);
        }

        public Task<DBSemanticDomainFull?> GetSemanticDomainFull(string id, string lang)
        {
            return Task.FromResult((DBSemanticDomainFull?)_responseObj);
        }

        public Task<DBSemanticDomainTreeNode?> GetSemanticDomainTreeNode(string id, string lang)
        {
            return Task.FromResult((DBSemanticDomainTreeNode?)_responseObj);
        }

        public Task<DBSemanticDomainTreeNode?> GetSemanticDomainTreeNodeByName(string name, string lang)
        {
            return Task.FromResult((DBSemanticDomainTreeNode?)_responseObj);
        }

        internal void SetNextResponse(object? response)
        {
            _responseObj = response;
        }
    }
}
