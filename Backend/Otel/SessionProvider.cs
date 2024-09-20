using Microsoft.AspNetCore.Http;

namespace BackendFramework.Otel
{
    public class SessionProvider
    {
        private readonly IHttpContextAccessor _contextAccessor;
        public SessionProvider(IHttpContextAccessor contextAccessor)
        {
            _contextAccessor = contextAccessor;

        }
        public string GetSession()
        {
            // note: adding any activity tags in this function will cause overflow
            // because function called on each activity in OtelKernel
            if (_contextAccessor.HttpContext is { } context)
            {
                // context.Session.SetString("mysession", "mysessionValue");

                var sessId = context.Session.Id;
                // var sessId = context;

                return sessId;
            }
            return "noSess";
        }
    }
}
