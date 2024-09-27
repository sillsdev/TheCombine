using System.Diagnostics.CodeAnalysis;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Contexts
{
    [ExcludeFromCodeCoverage]
    public class BannerContext : IBannerContext
    {
        private readonly IMongoDbContext _mongoDbContext;

        public BannerContext(IMongoDbContext mongoDbContext)
        {
            _mongoDbContext = mongoDbContext;
        }

        public IMongoCollection<Banner> Banners => _mongoDbContext.Db.GetCollection<Banner>("BannerCollection");
    }
}
