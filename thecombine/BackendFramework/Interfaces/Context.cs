using BackendFramework.ValueModels;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BackendFramework.Interfaces
{
    public interface IWordContext
    {
        IMongoCollection<Word> Words { get; }
    }
}
