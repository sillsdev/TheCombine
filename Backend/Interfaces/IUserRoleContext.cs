using BackendFramework.ValueModels;
using MongoDB.Driver;

namespace BackendFramework.Interfaces
{
    public interface IUserRoleContext
    {
        IMongoCollection<UserRole> UserRoles { get; }
    }
}
