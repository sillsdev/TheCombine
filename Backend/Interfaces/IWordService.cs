using BackendFramework.ValueModels;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace BackendFramework.Interfaces
{
    public interface IWordService
    {
        //calls for collection
        Task<List<Word>> GetAllWords();
        //Task<List<Word>> GetWord(string Id);

        //called on collection, returns a list of words
        Task<List<Word>> GetWords(List<string> Ids);
        Task<Word> Create(Word word);
        Task<bool> Update(string Id, Word word);
        Task<bool> Delete(string Id);
        Task<bool> DeleteAllWords();

        Task<List<Word>> GetFrontier();
        Task<Word> AddFrontier(Word word);
        Task<bool> DeleteFrontier(string id);
    }
}
