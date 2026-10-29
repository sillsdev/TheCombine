using System;
using System.Collections.Generic;
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

        public const int EntriesPageSize = 1000;

        private HttpClient CreateClient(string accessToken)
        {
            var httpClient = _httpClientFactory.CreateClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            return httpClient;
        }

        public async Task<List<LexboxProject>> GetMyProjectsAsync(string accessToken)
        {
            var httpClient = CreateClient(accessToken);

            var response = await httpClient.PostAsJsonAsync(LexboxQuery.QueryUrl,
                new LexboxQuery { Query = LexboxQuery.MyProjectsQuery });

            if (!response.IsSuccessStatusCode)
            {
                throw await FailedRequestException(response, "Lexbox GraphQL request failed");
            }

            var graph = await response.Content.ReadFromJsonAsync<LexboxQueryResponse<MyProjectsData>>()
                ?? throw new LexboxQueryException("Lexbox GraphQL response was empty", "");

            if (graph.Errors is { Length: > 0 })
            {
                var errorText = string.Join("; ",
                    graph.Errors.Select(e => e.Message).Where(m => !string.IsNullOrEmpty(m)));
                throw new LexboxQueryException("Lexbox GraphQL returned errors", errorText);
            }

            var me = graph.Data?.MeAuth ?? throw new LexboxQueryException("Lexbox GraphQL response had no user", "");
            return graph.Data.MyProjects.Select(p => new LexboxProject(p, me)).ToList();
        }

        public async Task CheckProjectEntriesAsync(string accessToken, string projectCode)
        {
            await GetEntriesPageAsync(CreateClient(accessToken), projectCode, 0, 1);
        }

        public async Task<List<Word>> GetProjectEntriesAsync(
            string accessToken, string projectCode, string vernacularLang, List<string> analysisLangs)
        {
            var httpClient = CreateClient(accessToken);

            // Lexbox's Count=-1 (QueryOptions.QueryAll) becomes a $limit of 0, which its Mongo driver rejects,
            // so page through the entries instead. Lexbox sorts them by headword, morph type, then id.
            var lexboxEntries = new List<LexboxEntry>();
            List<LexboxEntry> page;
            do
            {
                page = await GetEntriesPageAsync(httpClient, projectCode, lexboxEntries.Count, EntriesPageSize);
                lexboxEntries.AddRange(page);
            } while (page.Count == EntriesPageSize);

            return lexboxEntries
                .Where(e => e.DeletedAt is null)
                .Select(e => e.ToWord(vernacularLang, analysisLangs))
                .OfType<Word>()
                .ToList();
        }

        private static async Task<List<LexboxEntry>> GetEntriesPageAsync(
            HttpClient httpClient, string projectCode, int offset, int count)
        {
            var url = $"{LexboxQuery.LfClassicBaseUrl}/{Uri.EscapeDataString(projectCode)}/entries"
                + $"?Count={count}&Offset={offset}";
            var response = await httpClient.GetAsync(url);

            switch (response.StatusCode)
            {
                case HttpStatusCode.Forbidden:
                    throw new LexboxQueryException("Lexbox access denied",
                        $"Reading entries of project '{projectCode}' requires the Manager or Editor role.",
                        StatusCodes.Status403Forbidden);
                case HttpStatusCode.NotFound:
                    throw new LexboxQueryException("Language Forge project not found",
                        $"Project '{projectCode}' was not found in Language Forge.", StatusCodes.Status404NotFound);
            }

            if (!response.IsSuccessStatusCode)
            {
                throw await FailedRequestException(response, "Project entries request failed");
            }

            return await response.Content.ReadFromJsonAsync<List<LexboxEntry>>() ?? [];
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
