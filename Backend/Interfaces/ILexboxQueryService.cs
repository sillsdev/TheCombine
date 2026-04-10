using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface ILexboxQueryService
    {
        Task<List<LexboxProject>> GetMyProjectsAsync(string accessToken);
        Task<List<Word>> GetProjectEntriesAsync(string accessToken, string projectCode, string vernacularLang);
    }
}
