using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Services
{
    public sealed class LexboxQueryService(IHttpClientFactory httpClientFactory)
    {
        private readonly IHttpClientFactory _httpClientFactory = httpClientFactory;

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

            var graph = await response.Content.ReadFromJsonAsync<LexboxQueryResponse<MyProjectsData>>();
            if (graph is null)
            {
                throw new LexboxQueryException("Lexbox GraphQL response was empty", "");
            }

            if (graph.Errors is { Length: > 0 })
            {
                var errorText = string.Join("; ",
                    graph.Errors.Select(e => e.Message).Where(m => !string.IsNullOrEmpty(m)));
                throw new LexboxQueryException("Lexbox GraphQL returned errors", errorText);
            }

            return graph.Data?.MyProjects?.Select(p => new LexboxProject(p)).ToList() ?? [];
        }

        public async Task<List<LexboxEntry>> GetProjectEntriesAsync(string accessToken, string projectType, string projectCode)
        {
            var httpClient = _httpClientFactory.CreateClient();
            httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", accessToken);

            var url = $"{LexboxQuery.MiniLcmBaseUrl}/{projectType}/{projectCode}/entries";
            var response = await httpClient.GetAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                var responseBody = await response.Content.ReadAsStringAsync();
                throw new LexboxQueryException("Lexbox MiniLcm entries request failed",
                    $"Status: {(int)response.StatusCode} {response.ReasonPhrase}"
                        + (string.IsNullOrEmpty(responseBody) ? "" : $"\nBody: {responseBody}"));
            }

            return await response.Content.ReadFromJsonAsync<List<LexboxEntry>>() ?? [];
        }
    }
}
