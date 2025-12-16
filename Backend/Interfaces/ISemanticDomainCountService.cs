using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface ISemanticDomainCountService
    {
        Task UpdateCountsForWord(Word word);
        Task UpdateCountsForWords(List<Word> words);
        Task UpdateCountsAfterWordUpdate(Word oldWord, Word newWord);
        Task MigrateCounts(string projectId);
    }
}
