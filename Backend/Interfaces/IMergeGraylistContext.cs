using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Interfaces
{
    public interface IMergeGraylistContext
    {
        IMongoCollection<MergeWordSet> MergeGraylist { get; }
    }
}
