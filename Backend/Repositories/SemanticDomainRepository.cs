using System;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Repositories
{
    public class SemanticDomainRepository : ISemanticDomainRepository
    {
        private ISemanticDomainContext _context;
        public SemanticDomainRepository(ISemanticDomainContext context)
        {
            _context = context;
        }

        public async Task<SemanticDomainTreeNode?> GetSemanticDomainTreeNode(string id, string lang)
        {
            var filterDef = new FilterDefinitionBuilder<SemanticDomainTreeNode>();
            var filter = filterDef.And(
                filterDef.Eq(x => x.Id, id),
                filterDef.Eq(x => x.Lang, lang));

            var domain = await _context.SemanticDomains.FindAsync(filter: filter);
            try
            {
                return await domain.FirstAsync();
            }
            catch (InvalidOperationException)
            {
                return null;
            }
        }

        public async Task<SemanticDomainTreeNode?> GetSemanticDomainTreeNodeByName(string name, string lang)
        {
            var filterDef = new FilterDefinitionBuilder<SemanticDomainTreeNode>();
            var filter = filterDef.And(
                filterDef.Eq(x => x.Name, name),
                filterDef.Eq(x => x.Lang, lang));
            var domain = await _context.SemanticDomains.FindAsync(filter: filter);
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
