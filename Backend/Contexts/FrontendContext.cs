using BackendFramework.Interfaces;
using static BackendFramework.Startup;
using Microsoft.Extensions.Options;

namespace BackendFramework.Contexts
{
    public class FrontendContext : IFrontendContext
    {
        public string FrontendUrl { get; set; }

        public FrontendContext(IOptions<Settings> options)
        {
            this.FrontendUrl = options.Value.FrontendUrl;
        }
    }
}
