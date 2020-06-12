using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Interfaces
{
    public interface IPasswordResetContext
    {
        IMongoCollection<PasswordReset> PasswordResets { get; }
    }
}
