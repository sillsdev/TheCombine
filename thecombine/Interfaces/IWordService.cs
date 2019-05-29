using BackendFramework.ValueModels;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BackendFramework.WordService
{
    public interface IWordService
    {
        Task<IEnumerable<Word>> GetAllWords();
        Task<Word> GetWord(string Id);
        Task Create(Word word);
        Task<bool> Update(string Id);
        Task<bool> Delete(string Id);
    }
}
