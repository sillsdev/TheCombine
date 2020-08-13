using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Interfaces
{
    public interface IWordRepository
    {
        Task<List<Word>> GetAllWords(string projectId);
        Task<Word> GetWord(string projectId, string wordId);
        Task<Word> Create(Word word);
        Task<Word> Add(Word word);
        Task<bool> DeleteAllWords(string projectId);
        Task<List<Word>> GetFrontier(string projectId);
        Task<Word> GetFrontierWordToDelete(string wordId);
        Task<Word> AddFrontier(Word word);
        Task<int> UpdateFrontierWord(Word word);
        Task<bool> DeleteFrontier(string projectId, string wordId);
    }
}
