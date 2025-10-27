using System;
using System.Diagnostics.CodeAnalysis;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Otel;
using MongoDB.Driver;
using MongoDB.Bson;
using System.Collections.Generic;

namespace BackendFramework.Repositories
{
    /// <summary>
    /// Atomic database functions for <see cref="SemanticDomainFull"/>s and <see cref="SemanticDomainTreeNode"/>s.
    /// </summary>
    [ExcludeFromCodeCoverage]
    public class SemanticDomainRepository(IMongoDbContext dbContext) : ISemanticDomainRepository
    {
        private readonly IMongoCollection<SemanticDomainFull> _fullSemanticDomains =
            dbContext.Db.GetCollection<SemanticDomainFull>("SemanticDomains");
        private readonly IMongoCollection<SemanticDomainTreeNode> _semanticDomains =
            dbContext.Db.GetCollection<SemanticDomainTreeNode>("SemanticDomainTree");

        private const string otelTagName = "otel.SemanticDomainRepository";

        public async Task<SemanticDomainTreeNode?> GetSemanticDomainTreeNode(string id, string lang)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting semantic domain tree node");

            var filterDef = new FilterDefinitionBuilder<SemanticDomainTreeNode>();
            var filter = filterDef.And(
                filterDef.Eq(x => x.Id, id),
                filterDef.Eq(x => x.Lang, lang));

            var domain = await _semanticDomains.FindAsync(filter: filter);
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
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting semantic domain tree node by name");

            var filterDef = new FilterDefinitionBuilder<SemanticDomainTreeNode>();
            var filter = filterDef.And(
                filterDef.Regex(x => x.Name, new BsonRegularExpression("/^" + name + "$/i")),
                filterDef.Eq(x => x.Lang, lang));
            var domain = await _semanticDomains.FindAsync(filter: filter);
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
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting full semantic domain");

            var filterDef = new FilterDefinitionBuilder<SemanticDomainFull>();
            var filter = filterDef.And(
                filterDef.Eq(x => x.Id, id),
                filterDef.Eq(x => x.Lang, lang));
            var domain = await _fullSemanticDomains.FindAsync(filter);
            try
            {
                return await domain.FirstAsync();
            }
            catch (InvalidOperationException)
            {
                return null;
            }
        }


        // Get a list of all SemanticDomainTreeNodes in specified language except the root node
        public async Task<List<SemanticDomainTreeNode>?> GetAllSemanticDomainTreeNodes(string lang)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting all semantic domain tree nodes");

            var filterDef = new FilterDefinitionBuilder<SemanticDomainTreeNode>();
            var filter = filterDef.And(
                filterDef.Where(x => x.Id != "Sem"),
                filterDef.Eq(x => x.Lang, lang));
            var domain = await _semanticDomains.FindAsync(filter: filter);
            try
            {
                return await domain.ToListAsync();
            }
            catch (InvalidOperationException)
            {
                return null;
            }
        }
    }
}
