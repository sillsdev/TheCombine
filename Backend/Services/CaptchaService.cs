using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Net.Http;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Otel;

namespace BackendFramework.Services
{
    [ExcludeFromCodeCoverage]
    public class CaptchaService : ICaptchaService
    {
        private readonly ICaptchaContext _captchaContext;

        private const string otelTagName = "otel.CaptchaService";

        public CaptchaService(ICaptchaContext captchaContext)
        {
            _captchaContext = captchaContext;
        }

        public async Task<bool> VerifyToken(string token)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "verifying CAPTCHA token");

            if (!_captchaContext.CaptchaEnabled)
            {
                throw new CaptchaNotEnabledException();
            }

            var secret = _captchaContext.CaptchaSecretKey;
            var verifyUrl = _captchaContext.CaptchaVerifyUrl;
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

        private sealed class CaptchaNotEnabledException : Exception { }
    }
}
