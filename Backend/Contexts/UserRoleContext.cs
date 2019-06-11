using BackendFramework.ValueModels;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using static BackendFramework.Startup;
using BackendFramework.Interfaces;
namespace BackendFramework.Context
{

    public class UserRoleContext : IUserRoleContext
    {
        private readonly IMongoDatabase _db;

        public UserRoleContext(IOptions<Settings> options)
        {
            var client = new MongoClient(options.Value.ConnectionString);
            _db = client.GetDatabase(options.Value.UserRolesDatabase);
        }

        public IMongoCollection<UserRole> UserRoles => _db.GetCollection<UserRole>("UserRolesDatabase");
    }
    
}