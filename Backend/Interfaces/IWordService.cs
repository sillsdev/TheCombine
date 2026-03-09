using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IWordService
    {
        Task<List<Word>> ImportWords(List<Word> words);
        Task<Word> Create(string userId, Word word);
        Task<Word?> DeleteAudio(string projectId, string userId, string wordId, string fileName);
        Task<string?> DeleteFrontierWord(string projectId, string userId, string wordId);
        Task<bool> RestoreFrontierWord(string projectId, string wordId);
        Task<Word?> Update(string userId, Word word);
        Task<string?> FindContainingWord(Word word);
        Task<List<Word>?> MergeReplaceFrontier(
            string projectId, string userId, List<Word> parents, List<string> idsToDelete);
        Task<bool> RevertMergeReplaceFrontier(
            string projectId, string userId, List<string> idsToRestore, List<string> idsToDelete);
    }
}
