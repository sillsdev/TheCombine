using System.Diagnostics.CodeAnalysis;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Contexts
{
    [ExcludeFromCodeCoverage]
    public class UserEditContext : IUserEditContext
    {
        private readonly IMongoDbContext _mongoDbContext;
        public UserEditContext(IMongoDbContext mongoDbContext)
        {
            _mongoDbContext = mongoDbContext;
        }

        public IMongoCollection<UserEdit> UserEdits => _mongoDbContext.Db.GetCollection<UserEdit>("UserEditsCollection");
    }
}
