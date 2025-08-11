using System.Diagnostics.CodeAnalysis;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Contexts
{
    [ExcludeFromCodeCoverage]
    public class UserRoleContext(IMongoDbContext mongoDbContext) : IUserRoleContext
    {
        private readonly IMongoDatabase _db = mongoDbContext.Db;

        public IMongoCollection<UserRole> UserRoles => _db.GetCollection<UserRole>("UserRolesCollection");
    }
}
