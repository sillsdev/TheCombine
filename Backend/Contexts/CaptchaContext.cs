using System.Diagnostics.CodeAnalysis;
using BackendFramework.Interfaces;
using Microsoft.Extensions.Options;

namespace BackendFramework.Contexts
{
    [ExcludeFromCodeCoverage]
    public class CaptchaContext : ICaptchaContext
    {
        public bool CaptchaEnabled { get; }
        public string? CaptchaSecretKey { get; }
        public string? CaptchaVerifyUrl { get; }

        public CaptchaContext(IOptions<Startup.Settings> options)
        {
            CaptchaEnabled = options.Value.CaptchaEnabled;
            CaptchaSecretKey = options.Value.CaptchaSecretKey;
            CaptchaVerifyUrl = options.Value.CaptchaVerifyUrl;
        }
    }
}
