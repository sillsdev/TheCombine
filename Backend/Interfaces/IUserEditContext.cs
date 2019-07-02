using BackendFramework.ValueModels;
using MongoDB.Driver;

namespace BackendFramework.Interfaces
{
    public interface IUserEditContext
    {
        IMongoCollection<UserEdit> UserEdits { get; }
    }
}
