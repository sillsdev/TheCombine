using System.Diagnostics.CodeAnalysis;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using static BackendFramework.Startup;

namespace BackendFramework.Contexts
{
    [ExcludeFromCodeCoverage]
    public class UserEditContext : IUserEditContext
    {
        private readonly IMongoDatabase _db;

        public UserEditContext(IOptions<Settings> options)
        {
            var client = new MongoClient(options.Value.ConnectionString);
            _db = client.GetDatabase(options.Value.CombineDatabase);
        }

        public IMongoCollection<UserEdit> UserEdits => _db.GetCollection<UserEdit>("UserEditsCollection");
    }
}
