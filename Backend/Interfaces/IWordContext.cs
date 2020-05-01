using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Interfaces
{
    public interface IWordContext
    {
        IMongoCollection<Word> Words { get; }
        IMongoCollection<Word> Frontier { get; }
    }
}
