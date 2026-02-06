using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IWordRepository
    {
        Task<List<Word>> GetAllWords(string projectId);
        Task<Word?> GetWord(string projectId, string wordId);
        Task<Word> Create(Word word);
        Task<List<Word>> Create(List<Word> words);
        Task<Word> Add(Word word);
        Task<bool> DeleteAllWords(string projectId);
        Task<bool> DeleteAllFrontierWords(string projectId);
        Task<bool> HasWords(string projectId);
        Task<bool> HasFrontierWords(string projectId);
        Task<bool> IsInFrontier(string projectId, string wordId);
        Task<bool> AreInFrontier(string projectId, List<string> wordIds, int count);
        Task<int> GetFrontierCount(string projectId);
        Task<List<Word>> GetFrontier(string projectId);
        Task<List<Word>> GetFrontierWithVernacular(string projectId, string vernacular);
        Task<Word> AddFrontier(Word word);
        Task<List<Word>> AddFrontier(List<Word> words);
        Task<Word?> DeleteFrontier(string projectId, string wordId, string? audioFileName = null);
    }
}
