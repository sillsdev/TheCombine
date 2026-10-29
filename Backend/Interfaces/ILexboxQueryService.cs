using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface ILexboxQueryService
    {
        Task<List<LexboxProject>> GetMyProjectsAsync(string accessToken);
        /// <summary> Throws a <see cref="LexboxQueryException"/> if the project's entries can't be read. </summary>
        Task CheckProjectEntriesAsync(string accessToken, string projectCode);
        Task<List<Word>> GetProjectEntriesAsync(
            string accessToken, string projectCode, string vernacularLang, List<string> analysisLangs);
    }
}
