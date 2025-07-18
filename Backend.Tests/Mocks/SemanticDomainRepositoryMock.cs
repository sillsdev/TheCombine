﻿using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;

namespace Backend.Tests.Mocks
{
    internal sealed class SemanticDomainRepositoryMock : ISemanticDomainRepository
    {
        private object? _responseObj;

        public Task<List<SemanticDomainTreeNode>?> GetAllSemanticDomainTreeNodes(string lang)
        {
            return Task.FromResult((List<SemanticDomainTreeNode>?)_responseObj);
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
    }
}
