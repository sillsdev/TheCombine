using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Services
{
    /// <summary> UNUSED: Creates a tree structure JSON object of semantic domains used by the front end </summary>
    public class SemanticDomainRepository : ISemanticDomainRepository
    {
        private ISemanticDomainsContext _context;
        public SemanticDomainRepository(ISemanticDomainsContext context)
        {
            _context = context;
        }

        public async Task<SemanticDomainTreeNode?> GetSemanticDomainTreeNode(string id, string lang)
        {
            var filterDef = new FilterDefinitionBuilder<SemanticDomainTreeNode>();
            var filter = filterDef.And(
                filterDef.Eq(x => x.Id, id),
                filterDef.Eq(x => x.Lang, lang));
            var domain = await _context.SemanticDomains.FindAsync(filter);
            try
            {
                return await domain.FirstAsync();
            }
            catch (InvalidOperationException)
            {
                return null;
            }
        }

        public async Task<SemanticDomainFull?> GetSemanticDomainFull(string id, string lang)
        {
            var filterDef = new FilterDefinitionBuilder<SemanticDomainFull>();
            var filter = filterDef.And(
                filterDef.Eq(x => x.Id, id),
                filterDef.Eq(x => x.Lang, lang));
            var domain = await _context.FullSemanticDomains.FindAsync(filter);
            try
            {
                return await domain.FirstAsync();
            }
            catch (InvalidOperationException)
            {
                return null;
            }
        }
    }
}
