using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IWordService
    {
        Task<Word> Create(string userId, Word word);
        Task<List<Word>> Create(string userId, List<Word> words);
        Task<Word?> Update(string userId, Word word);
        Task<string?> DeleteAudio(string projectId, string userId, string wordId, string fileName);
        Task<string?> DeleteFrontierWord(string projectId, string userId, string wordId);
        Task<int> TryDeleteFrontierWords(string projectId, string userId, List<string> wordIds);
        Task<bool> RestoreToFrontier(string projectId, string wordId);
        Task<bool> RestoreToFrontier(string projectId, List<string> wordIds);
        Task<string?> FindContainingWord(Word word);
    }
}
