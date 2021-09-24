using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Interfaces
{
    public interface IBannerContext
    {
        IMongoCollection<Banner> Banners { get; }
    }
}
