using System.Diagnostics.CodeAnalysis;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Contexts
{
    [ExcludeFromCodeCoverage]
    public class ProjectContext(IMongoDbContext mongoDbContext) : IProjectContext
    {
        private readonly IMongoDatabase _db = mongoDbContext.Db;

        public IMongoCollection<Project> Projects => _db.GetCollection<Project>("ProjectsCollection");
    }
}
