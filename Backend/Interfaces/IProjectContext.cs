using BackendFramework.ValueModels;
using MongoDB.Driver;

namespace BackendFramework.Interfaces
{
    public interface IProjectContext
    {
        IMongoCollection<Project> Projects { get; }
    }
}
