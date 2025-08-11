using System.Diagnostics.CodeAnalysis;
using BackendFramework.Interfaces;
using Microsoft.Extensions.Options;

namespace BackendFramework.Contexts
{
    [ExcludeFromCodeCoverage]
    public class CaptchaContext(IOptions<Startup.Settings> options) : ICaptchaContext
    {
        public bool CaptchaEnabled { get; } = options.Value.CaptchaEnabled;
        public string? CaptchaSecretKey { get; } = options.Value.CaptchaSecretKey;
        public string? CaptchaVerifyUrl { get; } = options.Value.CaptchaVerifyUrl;
    }
}
