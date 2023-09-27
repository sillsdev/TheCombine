using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Interfaces
{
    public interface IMergeWordSetContext
    {
        IMongoCollection<MergeWordSet> MergeWordSet { get; }
    }
}
