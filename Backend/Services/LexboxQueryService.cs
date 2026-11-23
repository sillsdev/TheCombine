using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Http;

namespace BackendFramework.Services
{
    public sealed class LexboxQueryService(IHttpClientFactory httpClientFactory) : ILexboxQueryService
    {
        private readonly IHttpClientFactory _httpClientFactory = httpClientFactory;

        private const int MaxConcurrentDownloads = 4;

        private HttpClient CreateClient(string accessToken)
        {
            var httpClient = _httpClientFactory.CreateClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            return httpClient;
        }

        private static string ProjectUrl(Guid projectId) => $"{LexboxQuery.LexiconUrl}/project/{projectId}";

        public async Task<List<LexboxProject>> GetMyProjectsAsync(string accessToken)
        {
            var httpClient = CreateClient(accessToken);

            var response = await httpClient.GetAsync($"{LexboxQuery.LexiconUrl}/projects");
            if (!response.IsSuccessStatusCode)
            {
                throw await FailedRequestException(response, "Lexbox projects request failed");
            }
            var projects = await response.Content.ReadFromJsonAsync<List<LexiconProjectDto>>() ?? [];

            return (await Task.WhenAll(projects.Select(async p =>
                new LexboxProject(p, await GetWritingSystemsAsync(httpClient, p.Id))))).ToList();
        }

        private static async Task<LexboxWritingSystemsDto> GetWritingSystemsAsync(
            HttpClient httpClient, Guid projectId)
        {
            var response = await httpClient.GetAsync($"{ProjectUrl(projectId)}/writing-systems");
            await ThrowIfProjectRequestFailed(response, projectId, "Project writing systems request failed");
            return await response.Content.ReadFromJsonAsync<LexboxWritingSystemsDto>() ?? new();
        }

        public async Task CheckProjectEntriesAsync(string accessToken, Guid projectId)
        {
            var response = await CreateClient(accessToken).GetAsync($"{ProjectUrl(projectId)}/entries?Count=1");
            await ThrowIfProjectRequestFailed(response, projectId, "Project entries request failed");
        }

        public async Task<List<Word>> GetProjectEntriesAsync(
            string accessToken, Guid projectId, string vernacularLang, List<string> analysisLangs)
        {
            // Count=-1 asks for all entries. Lexbox streams them, so read them as they arrive: once the headers
            // are read, the client's timeout no longer applies, and a big lexicon is never held as one string.
            using var response = await CreateClient(accessToken).GetAsync(
                $"{ProjectUrl(projectId)}/entries?Count=-1", HttpCompletionOption.ResponseHeadersRead);
            await ThrowIfProjectRequestFailed(response, projectId, "Project entries request failed");

            var words = new List<Word>();
            await foreach (var entry in response.Content.ReadFromJsonAsAsyncEnumerable<LexboxEntry>())
            {
                if (entry?.ToWord(vernacularLang, analysisLangs) is Word word)
                {
                    words.Add(word);
                }
            }
            return words;
        }

        public async Task DownloadAudioAsync(string accessToken, List<Word> words, string audioDir)
        {
            var httpClient = CreateClient(accessToken);
            var audioByFileId = words.SelectMany(w => w.Audio).GroupBy(a => Guid.Parse(a.FileName)).ToList();
            var fileNames = new ConcurrentDictionary<Guid, string>();
            var options = new ParallelOptions { MaxDegreeOfParallelism = MaxConcurrentDownloads };
            await Parallel.ForEachAsync(audioByFileId, options, async (audio, _) =>
            {
                if (await DownloadMediaFileAsync(httpClient, audio.Key, audioDir) is string fileName)
                {
                    fileNames[audio.Key] = fileName;
                }
            });

            foreach (var word in words)
            {
                word.Audio.RemoveAll(a => !fileNames.ContainsKey(Guid.Parse(a.FileName)));
                word.Audio.ForEach(a => a.FileName = fileNames[Guid.Parse(a.FileName)]);
            }
        }

        /// <summary> Saves a Lexbox media file as "{fileId}{extension}" in a directory. </summary>
        /// <returns> The saved file's name, or null if Lexbox doesn't have the file. </returns>
        private static async Task<string?> DownloadMediaFileAsync(HttpClient httpClient, Guid fileId, string dir)
        {
            using var response = await httpClient.GetAsync(
                $"{LexboxQuery.MediaUrl}/{fileId}", HttpCompletionOption.ResponseHeadersRead);
            // Lexbox returns 404 for a file missing from storage, and 403 for a file id it doesn't know.
            if (response.StatusCode is HttpStatusCode.NotFound or HttpStatusCode.Forbidden)
            {
                return null;
            }
            if (!response.IsSuccessStatusCode)
            {
                throw await FailedRequestException(response, "Lexbox audio request failed");
            }

            var disposition = response.Content.Headers.ContentDisposition;
            var originalName = (disposition?.FileNameStar ?? disposition?.FileName ?? "").Trim('"');
            var extension = Path.GetExtension(originalName);
            if (!extension.Skip(1).All(char.IsAsciiLetterOrDigit))
            {
                extension = "";
            }

            var fileName = $"{fileId}{extension}";
            await using var fileStream = new FileStream(Path.Combine(dir, fileName), FileMode.Create);
            await response.Content.CopyToAsync(fileStream);
            return fileName;
        }

        private static async Task ThrowIfProjectRequestFailed(
            HttpResponseMessage response, Guid projectId, string title)
        {
            switch (response.StatusCode)
            {
                case HttpStatusCode.Forbidden:
                    throw new LexboxQueryException("Lexbox access denied",
                        $"You don't have access to Lexbox project {projectId}.", StatusCodes.Status403Forbidden);
                case HttpStatusCode.NotFound:
                    throw new LexboxQueryException("Lexbox project not found",
                        $"Project {projectId} was not found in Lexbox.", StatusCodes.Status404NotFound);
                case HttpStatusCode.Conflict:
                    // For reads, Lexbox returns 409 only for a project not yet synced to FieldWorks Lite.
                    throw new LexboxQueryException("Lexbox project not ready",
                        $"Project {projectId} has not been synced to FieldWorks Lite on Lexbox yet.",
                        StatusCodes.Status409Conflict);
            }

            if (!response.IsSuccessStatusCode)
            {
                throw await FailedRequestException(response, title);
            }
        }

        private static async Task<LexboxQueryException> FailedRequestException(
            HttpResponseMessage response, string title)
        {
            if (response.StatusCode == HttpStatusCode.Unauthorized)
            {
                return LexboxQueryException.NotLoggedIn();
            }

            var responseBody = await response.Content.ReadAsStringAsync();
            return new LexboxQueryException(title, $"Status: {(int)response.StatusCode} {response.ReasonPhrase}"
                + (string.IsNullOrEmpty(responseBody) ? "" : $"\nBody: {responseBody}"));
        }
    }
}
