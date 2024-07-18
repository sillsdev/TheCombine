using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Net.Http;
using System.Threading.Tasks;
using BackendFramework.Interfaces;

namespace BackendFramework.Services
{
    [ExcludeFromCodeCoverage]
    public class TurnstileService : ITurnstileService
    {
        private readonly ITurnstileContext _turnstileContext;

        public TurnstileService(ITurnstileContext turnstileContext)
        {
            _turnstileContext = turnstileContext;
        }

        public async Task<bool> VerifyToken(string token)
        {
            var secret = _turnstileContext.TurnstileSecretKey;
            var verifyUrl = _turnstileContext.TurnstileVerifyUrl;
            if (string.IsNullOrEmpty(secret) || string.IsNullOrEmpty(verifyUrl))
            {
                return false;
            }
            var httpContent = new FormUrlEncodedContent(new Dictionary<string, string>{
               {"response", token},
               {"secret", secret},
            });
            using var result = await new HttpClient().PostAsync(verifyUrl, httpContent);
            var contentString = await result.Content.ReadAsStringAsync();
            return contentString.Contains("\"success\":true");
        }
    }
}
