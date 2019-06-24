using BackendFramework.ValueModels;
using MongoDB.Driver;

namespace BackendFramework.Interfaces
{
    public interface IUserContext
    {
        IMongoCollection<User> Users { get; }
    }
}
