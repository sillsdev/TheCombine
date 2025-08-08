using System;

namespace BackendFramework.Helper
{
    public static class Domain
    {
        private static readonly string? frontendServer =
            Environment.GetEnvironmentVariable("COMBINE_FRONTEND_SERVER_NAME");

        public static readonly string FrontendDomain =
            frontendServer is null ? "http://localhost:3000" : $"https://{frontendServer}";
    }
}
