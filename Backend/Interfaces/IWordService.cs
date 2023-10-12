using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IWordService
    {
        Task<bool> Update(string projectId, string userId, string wordId, Word word);
        Task<bool> Delete(string projectId, string userId, string wordId);
        Task<Word?> Delete(string projectId, string userId, string wordId, string fileName);
        Task<string?> DeleteFrontierWord(string projectId, string userId, string wordId);
        Task<string?> FindContainingWord(Word word);
    }
}
