using System.Diagnostics.CodeAnalysis;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using static BackendFramework.Startup;

namespace BackendFramework.Contexts
{
    [ExcludeFromCodeCoverage]
    public class ProjectContext : IProjectContext
    {
        private readonly IMongoDatabase _db;

        public ProjectContext(IOptions<Settings> options)
        {
            var client = new MongoClient(options.Value.ConnectionString);
            _db = client.GetDatabase(options.Value.CombineDatabase);
        }

        public IMongoCollection<Project> Projects => _db.GetCollection<Project>("ProjectsCollection");
    }
}
