using BackendFramework.ValueModels;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace BackendFramework.Interfaces
{
    public interface IWordService
    {
        //calls for collection
        Task<List<Word>> GetAllWords();
        //called on collection, returns a list of words
        Task<List<Word>> GetWords(List<string> Ids);
        Task<List<Word>> GetRegexSearch(Regex reg);
        Task<Word> Create(Word word);
        Task<bool> Update(string Id, Word word);
        Task<bool> Delete(string Id);
        Task<bool> DeleteAllWords();
        Task<Word> Merge(MergeWords mergeWords);

        Task<List<Word>> GetFrontier();
        Task<Word> AddFrontier(Word word);
        Task<bool> DeleteFrontier(string id);
    }
}
