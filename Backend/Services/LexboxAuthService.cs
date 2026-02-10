using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Configuration;

namespace BackendFramework.Services
{
    public class LexboxAuthService(IConfiguration configuration, IHttpClientFactory httpClientFactory)
        : ILexboxAuthService, IDisposable
    {
        private readonly IConfiguration _configuration = configuration;
        private readonly IHttpClientFactory _httpClientFactory = httpClientFactory;
        private readonly ConcurrentDictionary<string, LexboxAuthState> _stateStore = new();
        private readonly ConcurrentDictionary<string, LexboxAuthSession> _sessionStore = new();
        private readonly SemaphoreSlim _openIdConfigLock = new(1, 1);
        private OpenIdConfiguration? _openIdConfiguration;
        private DateTimeOffset _openIdConfigExpiresAt = DateTimeOffset.MinValue;

        private static readonly TimeSpan StateTtl = TimeSpan.FromMinutes(15);
        private static readonly TimeSpan OpenIdConfigTtl = TimeSpan.FromHours(1);
        private static readonly TimeSpan DefaultTokenLifetime = TimeSpan.FromHours(1);

        public LexboxLoginUrl CreateLoginUrl(HttpRequest request, string sessionId, string? returnUrl)
        {
            var settings = GetSettings();
            var state = CreateState();
            var codeVerifier = CreateCodeVerifier();
            var codeChallenge = CreateCodeChallenge(codeVerifier);

            CleanupExpiredStates();
            _stateStore[state] = new LexboxAuthState(codeVerifier, DateTimeOffset.UtcNow, sessionId, returnUrl);

            var redirectUri = BuildRedirectUri(request);
            var query = new Dictionary<string, string?>
            {
                ["scope"] = settings.Scope,
                ["response_type"] = "code",
                ["client_id"] = settings.ClientId,
                ["redirect_uri"] = redirectUri,
                ["client-request-id"] = Guid.NewGuid().ToString(),
                ["x-client-SKU"] = settings.ClientSku,
                ["x-client-Ver"] = settings.ClientVersion,
                ["x-client-OS"] = settings.ClientOs,
                ["prompt"] = settings.Prompt,
                ["code_challenge"] = codeChallenge,
                ["code_challenge_method"] = "S256",
                ["state"] = state,
                ["client_info"] = "1",
                ["haschrome"] = "1",
            };

            var loginReturnUrl = QueryHelpers.AddQueryString("/api/oauth/open-id-auth", query);
            var loginUrl = $"{settings.BaseUrl.TrimEnd('/')}/login?ReturnUrl={Uri.EscapeDataString(loginReturnUrl)}";

            return new LexboxLoginUrl { Url = loginUrl };
        }

        public LexboxAuthUser? GetLoggedInUser(string? sessionId)
        {
            if (string.IsNullOrWhiteSpace(sessionId)) return null;
            if (!_sessionStore.TryGetValue(sessionId, out var session)) return null;
            if (session.ExpiresAt <= DateTimeOffset.UtcNow)
            {
                _sessionStore.TryRemove(sessionId, out _);
                return null;
            }

            return session.User;
        }

        public async Task<LexboxAuthResult?> CompleteLoginAsync(HttpRequest request, string code, string state)
        {
            CleanupExpiredStates();
            if (!_stateStore.TryRemove(state, out var pending)) return null;

            var settings = GetSettings();
            var redirectUri = BuildRedirectUri(request);
            var httpClient = _httpClientFactory.CreateClient();
            var openIdConfig = await GetOpenIdConfigurationAsync(httpClient, settings.BaseUrl);
            var tokenResponse = await ExchangeCodeForTokenAsync(httpClient,
                openIdConfig.TokenEndpoint,
                settings.ClientId,
                code,
                redirectUri,
                pending.CodeVerifier);
            if (tokenResponse is null) return new LexboxAuthResult { User = null, ReturnUrl = null };

            var user = GetUserFromIdToken(tokenResponse.IdToken)
                ?? await GetUserFromUserInfoAsync(httpClient, openIdConfig.UserInfoEndpoint, tokenResponse.AccessToken);
            if (user is null) return new LexboxAuthResult { User = null, ReturnUrl = null };

            var expiresInSeconds = tokenResponse.ExpiresIn ?? (int)DefaultTokenLifetime.TotalSeconds;
            var expiresAt = DateTimeOffset.UtcNow.AddSeconds(expiresInSeconds);
            _sessionStore[pending.SessionId] = new LexboxAuthSession(user, expiresAt, tokenResponse.AccessToken);
            return new LexboxAuthResult { User = user, ReturnUrl = pending.ReturnUrl };
        }

        private static string BuildRedirectUri(HttpRequest request)
        {
            var pathBase = request.PathBase.HasValue ? request.PathBase.Value : string.Empty;
            return $"{request.Scheme}://{request.Host}{pathBase}/api/auth/oauth-callback";
        }

        private LexboxAuthSettings GetSettings()
        {
            var baseUrl = _configuration["LexboxAuth:BaseUrl"] ?? "https://lexbox.org";
            var clientId = _configuration["LexboxAuth:ClientId"] ?? string.Empty;
            if (string.IsNullOrWhiteSpace(clientId))
            {
                throw new InvalidOperationException("LexboxAuth:ClientId must be configured.");
            }

            return new LexboxAuthSettings
            {
                BaseUrl = baseUrl,
                ClientId = clientId,
                Scope = _configuration["LexboxAuth:Scope"]
                    ?? "profile openid offline_access sendandreceive",
                Prompt = _configuration["LexboxAuth:Prompt"] ?? "select_account",
                ClientSku = _configuration["LexboxAuth:ClientSku"] ?? "TheCombine",
                ClientVersion = _configuration["LexboxAuth:ClientVersion"] ?? "1.0",
                ClientOs = _configuration["LexboxAuth:ClientOs"] ?? Environment.OSVersion.ToString(),
            };
        }

        private static string CreateCodeVerifier()
        {
            Span<byte> bytes = stackalloc byte[32];
            RandomNumberGenerator.Fill(bytes);
            return Base64UrlEncode(bytes);
        }

        private static string CreateCodeChallenge(string verifier)
        {
            var bytes = System.Text.Encoding.ASCII.GetBytes(verifier);
            var hash = SHA256.HashData(bytes);
            return Base64UrlEncode(hash);
        }

        private static string CreateState()
        {
            Span<byte> bytes = stackalloc byte[16];
            RandomNumberGenerator.Fill(bytes);
            return $"{Guid.NewGuid()}-{Base64UrlEncode(bytes)}";
        }

        private void CleanupExpiredStates()
        {
            var cutoff = DateTimeOffset.UtcNow - StateTtl;
            foreach (var entry in _stateStore)
            {
                if (entry.Value.CreatedAt < cutoff)
                {
                    _stateStore.TryRemove(entry.Key, out _);
                }
            }
        }

        private static string Base64UrlEncode(ReadOnlySpan<byte> data)
        {
            var base64 = Convert.ToBase64String(data);
            return base64.TrimEnd('=')
                .Replace('+', '-')
                .Replace('/', '_');
        }

        private sealed record LexboxAuthState(string CodeVerifier, DateTimeOffset CreatedAt, string SessionId, string? ReturnUrl);

        private sealed record LexboxAuthSession(LexboxAuthUser User, DateTimeOffset ExpiresAt, string? AccessToken);

        private sealed record OpenIdConfiguration(string TokenEndpoint, string? UserInfoEndpoint);

        private sealed record TokenResponse(string? AccessToken, string? IdToken, int? ExpiresIn);

        private sealed class LexboxAuthSettings
        {
            public string BaseUrl { get; set; } = "";
            public string ClientId { get; set; } = "";
            public string Scope { get; set; } = "";
            public string Prompt { get; set; } = "";
            public string ClientSku { get; set; } = "";
            public string ClientVersion { get; set; } = "";
            public string ClientOs { get; set; } = "";
        }

        public void Dispose()
        {
            _openIdConfigLock.Dispose();
            GC.SuppressFinalize(this);
        }

        private async Task<OpenIdConfiguration> GetOpenIdConfigurationAsync(HttpClient httpClient, string baseUrl)
        {
            if (_openIdConfiguration is not null && _openIdConfigExpiresAt > DateTimeOffset.UtcNow)
            {
                return _openIdConfiguration;
            }

            await _openIdConfigLock.WaitAsync();
            try
            {
                if (_openIdConfiguration is not null && _openIdConfigExpiresAt > DateTimeOffset.UtcNow)
                {
                    return _openIdConfiguration;
                }

                var configUrl = $"{baseUrl.TrimEnd('/')}/.well-known/openid-configuration";
                using var response = await httpClient.GetAsync(configUrl);
                response.EnsureSuccessStatusCode();
                var payload = await response.Content.ReadAsStringAsync();
                using var document = JsonDocument.Parse(payload);
                var root = document.RootElement;
                var tokenEndpoint = root.GetProperty("token_endpoint").GetString() ??
                                    throw new InvalidOperationException("Token endpoint missing from discovery document.");
                var userInfoEndpoint = root.TryGetProperty("userinfo_endpoint", out var userInfoProperty)
                    ? userInfoProperty.GetString()
                    : null;
                _openIdConfiguration = new OpenIdConfiguration(tokenEndpoint, userInfoEndpoint);
                _openIdConfigExpiresAt = DateTimeOffset.UtcNow.Add(OpenIdConfigTtl);
                return _openIdConfiguration;
            }
            finally
            {
                _openIdConfigLock.Release();
            }
        }

        private static async Task<TokenResponse?> ExchangeCodeForTokenAsync(HttpClient httpClient,
            string tokenEndpoint,
            string clientId,
            string code,
            string redirectUri,
            string codeVerifier)
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, tokenEndpoint)
            {
                Content = new FormUrlEncodedContent(new Dictionary<string, string>
                {
                    ["grant_type"] = "authorization_code",
                    ["client_id"] = clientId,
                    ["code"] = code,
                    ["redirect_uri"] = redirectUri,
                    ["code_verifier"] = codeVerifier,
                })
            };

            using var response = await httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode) return null;
            var payload = await response.Content.ReadAsStringAsync();
            using var document = JsonDocument.Parse(payload);
            var root = document.RootElement;
            var accessToken = root.TryGetProperty("access_token", out var accessTokenProperty)
                ? accessTokenProperty.GetString()
                : null;
            var idToken = root.TryGetProperty("id_token", out var idTokenProperty)
                ? idTokenProperty.GetString()
                : null;
            var expiresIn = root.TryGetProperty("expires_in", out var expiresProperty)
                ? expiresProperty.GetInt32()
                : (int?)null;
            return new TokenResponse(accessToken, idToken, expiresIn);
        }

        private static LexboxAuthUser? GetUserFromIdToken(string? idToken)
        {
            if (string.IsNullOrWhiteSpace(idToken)) return null;
            try
            {
                var handler = new JwtSecurityTokenHandler();
                var token = handler.ReadJwtToken(idToken);
                var userId = GetClaimValue(token, "sub");
                var displayName = GetClaimValue(token, "preferred_username")
                    ?? GetClaimValue(token, "email")
                    ?? GetClaimValue(token, "name")
                    ?? GetClaimValue(token, "upn")
                    ?? userId;
                if (string.IsNullOrWhiteSpace(displayName) && string.IsNullOrWhiteSpace(userId)) return null;
                return new LexboxAuthUser { UserId = userId, DisplayName = displayName };
            }
            catch (Exception)
            {
                return null;
            }
        }

        private static string? GetClaimValue(JwtSecurityToken token, string claimType)
        {
            return token.Claims.FirstOrDefault(claim => string.Equals(claim.Type, claimType, StringComparison.OrdinalIgnoreCase))?.Value;
        }

        private static async Task<LexboxAuthUser?> GetUserFromUserInfoAsync(HttpClient httpClient,
            string? userInfoEndpoint,
            string? accessToken)
        {
            if (string.IsNullOrWhiteSpace(userInfoEndpoint) || string.IsNullOrWhiteSpace(accessToken)) return null;
            using var request = new HttpRequestMessage(HttpMethod.Get, userInfoEndpoint);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            using var response = await httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode) return null;
            var payload = await response.Content.ReadAsStringAsync();
            using var document = JsonDocument.Parse(payload);
            var root = document.RootElement;
            var userId = root.TryGetProperty("sub", out var subProperty) ? subProperty.GetString() : null;
            var displayName = root.TryGetProperty("preferred_username", out var preferredProperty)
                ? preferredProperty.GetString()
                : null;
            displayName ??= root.TryGetProperty("email", out var emailProperty) ? emailProperty.GetString() : null;
            displayName ??= root.TryGetProperty("name", out var nameProperty) ? nameProperty.GetString() : null;
            displayName ??= userId;
            if (string.IsNullOrWhiteSpace(displayName) && string.IsNullOrWhiteSpace(userId)) return null;
            return new LexboxAuthUser { UserId = userId, DisplayName = displayName };
        }
    }
}
