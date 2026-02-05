using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Security.Cryptography;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Configuration;

namespace BackendFramework.Services
{
    public class LexboxAuthService(IConfiguration configuration) : ILexboxAuthService
    {
        private readonly IConfiguration _configuration = configuration;
        private readonly ConcurrentDictionary<string, LexboxAuthState> _stateStore = new();

        private static readonly TimeSpan StateTtl = TimeSpan.FromMinutes(15);

        public LexboxLoginUrl CreateLoginUrl(HttpRequest request)
        {
            var settings = GetSettings();
            var state = CreateState();
            var codeVerifier = CreateCodeVerifier();
            var codeChallenge = CreateCodeChallenge(codeVerifier);

            CleanupExpiredStates();
            _stateStore[state] = new LexboxAuthState(codeVerifier, DateTimeOffset.UtcNow);

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

            var returnUrl = QueryHelpers.AddQueryString("/api/oauth/open-id-auth", query);
            var loginUrl = $"{settings.BaseUrl.TrimEnd('/')}/login?ReturnUrl={Uri.EscapeDataString(returnUrl)}";

            return new LexboxLoginUrl { Url = loginUrl };
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

        private sealed record LexboxAuthState(string CodeVerifier, DateTimeOffset CreatedAt);

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
    }
}
