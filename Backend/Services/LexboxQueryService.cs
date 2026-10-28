using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;

namespace BackendFramework.Services
{
    public sealed class LexboxQueryService(IHttpClientFactory httpClientFactory) : ILexboxQueryService
    {
        private readonly IHttpClientFactory _httpClientFactory = httpClientFactory;

        public const int EntriesPageSize = 1000;

        public async Task<List<LexboxProject>> GetMyProjectsAsync(string accessToken)
        {
            var httpClient = _httpClientFactory.CreateClient();
            httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", accessToken);

            var response = await httpClient.PostAsJsonAsync(LexboxQuery.QueryUrl,
                new LexboxQuery { Query = LexboxQuery.MyProjectsQuery });

            if (!response.IsSuccessStatusCode)
            {
                var responseBody = await response.Content.ReadAsStringAsync();
                throw new LexboxQueryException("Lexbox GraphQL request failed",
                    $"Status: {(int)response.StatusCode} {response.ReasonPhrase}"
                        + (string.IsNullOrEmpty(responseBody) ? "" : $"\nBody: {responseBody}"));
            }

            var graph = await response.Content.ReadFromJsonAsync<LexboxQueryResponse<MyProjectsData>>()
                ?? throw new LexboxQueryException("Lexbox GraphQL response was empty", "");

            if (graph.Errors is { Length: > 0 })
            {
                var errorText = string.Join("; ",
                    graph.Errors.Select(e => e.Message).Where(m => !string.IsNullOrEmpty(m)));
                throw new LexboxQueryException("Lexbox GraphQL returned errors", errorText);
            }

            return graph.Data?.MyProjects?.Select(p => new LexboxProject(p)).ToList() ?? [];
        }

        public async Task<List<Word>> GetProjectEntriesAsync(
            string accessToken, string projectCode, string vernacularLang, List<string> analysisLangs)
        {
            var httpClient = _httpClientFactory.CreateClient();
            httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", accessToken);

            // Lexbox's Count=-1 (QueryOptions.QueryAll) becomes a $limit of 0, which its Mongo driver rejects,
            // so page through the entries instead. Lexbox sorts them by headword, morph type, then id.
            var lexboxEntries = new List<LexboxEntry>();
            List<LexboxEntry> page;
            do
            {
                page = await GetEntriesPageAsync(httpClient, projectCode, lexboxEntries.Count);
                lexboxEntries.AddRange(page);
            } while (page.Count == EntriesPageSize);

            return lexboxEntries
                .Where(e => e.DeletedAt is null)
                .Select(e => e.ToWord(vernacularLang, analysisLangs))
                .OfType<Word>()
                .ToList();
        }

        private static async Task<List<LexboxEntry>> GetEntriesPageAsync(
            HttpClient httpClient, string projectCode, int offset)
        {
            var url = $"{LexboxQuery.LfClassicBaseUrl}/{Uri.EscapeDataString(projectCode)}/entries"
                + $"?Count={EntriesPageSize}&Offset={offset}";
            var response = await httpClient.GetAsync(url);

            if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                throw new LexboxQueryException("Language Forge project not found",
                    $"Project '{projectCode}' was not found in Language Forge.");
            }

            if (!response.IsSuccessStatusCode)
            {
                var responseBody = await response.Content.ReadAsStringAsync();
                throw new LexboxQueryException("Project entries request failed",
                    $"Status: {(int)response.StatusCode} {response.ReasonPhrase}"
                        + (string.IsNullOrEmpty(responseBody) ? "" : $"\nBody: {responseBody}"));
            }

            return await response.Content.ReadFromJsonAsync<List<LexboxEntry>>() ?? [];
        }
    }
}
