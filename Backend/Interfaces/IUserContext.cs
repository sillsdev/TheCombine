using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Interfaces
{
    public interface IUserContext
    {
        IMongoCollection<User> Users { get; }
    }
}
