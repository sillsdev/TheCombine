using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Interfaces
{
    public interface IUserEditContext
    {
        IMongoCollection<UserEdit> UserEdits { get; }
    }
}
