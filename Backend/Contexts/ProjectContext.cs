using System.Diagnostics.CodeAnalysis;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Contexts
{
    [ExcludeFromCodeCoverage]
    public class ProjectContext : IProjectContext
    {
        private readonly IMongoDbContext _mongoDbContext;
        public ProjectContext(IMongoDbContext mongoDbContext)
        {
            _mongoDbContext = mongoDbContext;
        }

        public IMongoCollection<Project> Projects => _mongoDbContext.Db.GetCollection<Project>("ProjectsCollection");
    }
}
