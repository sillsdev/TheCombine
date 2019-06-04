using BackendFramework.ValueModels;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BackendFramework.Interfaces
{
    public interface IWordService
    {
        Task<List<Word>> GetAllWords();
        Task<Word> GetWord(string Id);

        Task<List<Word>> GetWords(System.Linq.Expressions.Expression<Func<Word, bool>> filter);
        Task<Word> Create(Word word);
        Task<bool> Update(string Id);
        Task<bool> Delete(string Id);
        Task<bool> DeleteAllWords();

        Task<List<Word>> GetFrontier();
        Task<Word> AddFrontier(Word word);
        Task<bool> DeleteFrontier(string id);
    }
}
