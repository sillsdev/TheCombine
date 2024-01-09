using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Interfaces
{
    public interface ISpeakerContext
    {
        IMongoCollection<Speaker> Speakers { get; }
    }
}
