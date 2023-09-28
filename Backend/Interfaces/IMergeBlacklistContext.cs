using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Interfaces
{
    public interface IMergeBlacklistContext
    {
        IMongoCollection<MergeWordSet> MergeBlacklist { get; }
    }
}
