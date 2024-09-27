using System.Diagnostics.CodeAnalysis;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Contexts
{
    [ExcludeFromCodeCoverage]
    public class UserRoleContext : IUserRoleContext
    {
        private readonly IMongoDbContext _mongoDbContext;
        public UserRoleContext(IMongoDbContext mongoDbContext)
        {
            _mongoDbContext = mongoDbContext;
        }

        public IMongoCollection<UserRole> UserRoles => _mongoDbContext.Db.GetCollection<UserRole>("UserRolesCollection");
    }
}
