using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface ILexboxQueryService
    {
        Task<List<LexboxProject>> GetMyProjectsAsync(string accessToken);
        /// <summary> Throws a <see cref="LexboxQueryException"/> if the project's entries can't be read. </summary>
        Task CheckProjectEntriesAsync(string accessToken, Guid projectId);
        /// <summary> Gets a project's entries as words. </summary>
        /// <remarks>
        /// Each <see cref="Pronunciation.FileName"/> is a Lexbox media file id, for <see cref="DownloadAudioAsync"/>.
        /// </remarks>
        Task<List<Word>> GetProjectEntriesAsync(
            string accessToken, Guid projectId, string vernacularLang, List<string> analysisLangs);
        /// <summary>
        /// Downloads the words' audio from Lexbox into a directory, replacing each Lexbox media file id with the
        /// downloaded file's name. Drops audio that Lexbox doesn't have.
        /// </summary>
        Task DownloadAudioAsync(string accessToken, List<Word> words, string audioDir);
    }
}
