using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IWordService
    {
        Task<List<Word>> ImportWords(List<Word> words);
        Task<Word> Create(string userId, Word word);
        Task<List<Word>> Create(string userId, List<Word> words);
        Task<List<Word>?> MergeReplaceFrontier(
            string projectId, string userId, List<Word> parents, List<string> idsToDelete);
        Task<Word?> Update(string userId, Word word);
        Task<Word?> DeleteAudio(string projectId, string userId, string wordId, string fileName);
        Task<string?> DeleteFrontierWord(string projectId, string userId, string wordId);
        Task<bool> RestoreFrontierWords(string projectId, List<string> wordIds);
        Task<string?> FindContainingWord(Word word);
    }
}
