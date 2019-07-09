using BackendFramework.ValueModels;
using System.Threading.Tasks;

namespace BackendFramework.Interfaces
{
    public interface IWordService
    {
        Task<bool> Update(string projectId, string wordId, Word word);
        Task<bool> Delete(string projectId, string wordId);
        Task<Word> Merge(string projectId, MergeWords mergeWords);
    }
}
