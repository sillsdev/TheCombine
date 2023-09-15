using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Interfaces
{
    public interface IMergeWordSetContext
    {
        IMongoCollection<MergeWordSetEntry> MergeWordSet { get; }
    }
}
