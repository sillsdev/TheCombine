using BackendFramework.ValueModels;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BackendFramework.Interfaces
{
    public interface IWordRepository
    {
        Task<List<Word>> GetAllWords();
        Task<Word> GetWord(string Id);
        Task<Word> Create(Word word);
        Task<Word> Add(Word word);
        Task<bool> DeleteAllWords();

        Task<List<Word>> GetFrontier();
        Task<Word> AddFrontier(Word word);
        Task<bool> DeleteFrontier(string id);
    }
}
