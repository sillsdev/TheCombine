using System.Diagnostics.CodeAnalysis;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Contexts
{
    [ExcludeFromCodeCoverage]
    public class UserContext : IUserContext
    {
        private readonly IMongoDbContext _mongoDbContext;
        public UserContext(IMongoDbContext mongoDbContext)
        {
            _mongoDbContext = mongoDbContext;
        }

        public IMongoCollection<User> Users => _mongoDbContext.Db.GetCollection<User>("UsersCollection");
    }
}
