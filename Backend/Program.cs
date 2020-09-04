using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;

namespace BackendFramework
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateWebHostBuilder(args).Build().Run();
        }

        public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                .ConfigureKestrel((context, options) =>
                {
                    // Allow clients to POST large files to servers, such as project imports.
                    // Note: The HTTP Proxy in front, such as NGNIX, also needs to be configured
                    //     to allow large requests through as well.
                    // 250MB.
                    options.Limits.MaxRequestBodySize = 250_000_000;
                })
                .UseStartup<Startup>();
    }
}
