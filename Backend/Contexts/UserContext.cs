using System.Diagnostics.CodeAnalysis;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Contexts
{
    [ExcludeFromCodeCoverage]
    public class UserContext(IMongoDbContext mongoDbContext) : IUserContext
    {
        private readonly IMongoDatabase _db = mongoDbContext.Db;

        public IMongoCollection<User> Users => _db.GetCollection<User>("UsersCollection");
    }
}
