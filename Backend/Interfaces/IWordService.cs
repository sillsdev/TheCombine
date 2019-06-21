using BackendFramework.ValueModels;
using System.Threading.Tasks;

namespace BackendFramework.Interfaces
{
    public interface IWordService
    {
        Task<bool> Update(string Id, Word word);
        Task<bool> Delete(string Id);
        Task<Word> Merge(MergeWords mergeWords);
    }
}
