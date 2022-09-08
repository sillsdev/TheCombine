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
                filterDef.Eq("id", id),
                filterDef.Eq(x => x.Lang, lang));

            var filterEn = filterDef.Eq("Lang", "en");
            var filterId = filterDef.Eq("id", "1");

            Console.WriteLine("Total in Lang = " + lang + ";id=" + id + ": " + _context.SemanticDomains.CountDocuments(filter: filterEn));
            Console.WriteLine("Total in Lang = " + lang + ";id=" + id + ": " + _context.SemanticDomains.CountDocuments(filter: filterId));
            var domain = await _context.SemanticDomains.FindAsync(filter: filter);
            try
            {
                return await domain.FirstAsync();
            }
            catch (InvalidOperationException e)
            {
                Console.WriteLine(e.Message);
                Console.WriteLine("****");
                Console.WriteLine(e.StackTrace);
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
            catch (InvalidOperationException e)
            {
                Console.WriteLine(e.Message);
                Console.WriteLine("****");
                Console.WriteLine(e.StackTrace);
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
