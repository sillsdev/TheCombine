// using System;
using System.Diagnostics;
using System.Diagnostics.Metrics;
using System.Threading.Tasks;


// using System.Diagnostics.Metrics;
// using System.Net.Http;
// using System.Net.Http.Json;
// using System.Security.Claims;
// using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

namespace BackendFramework.Otel
{

    public class OtelKernel
    {

        public const string ServiceName = "Backend-Otel";
        private readonly LocationCache _locationCache;

        public OtelKernel(LocationCache locationCache, IServiceCollection serviceCollection)
        {
            _locationCache = locationCache;
            AddOpenTelemetryInstrumentation(serviceCollection);
        }

        public void AddOpenTelemetryInstrumentation(IServiceCollection services)
        {
            var appResourceBuilder = ResourceBuilder.CreateDefault().AddService(ServiceName);
            // todo: include version 
            services.AddOpenTelemetry().WithTracing(tracerProviderBuilder => tracerProviderBuilder
                .SetResourceBuilder(appResourceBuilder)
                .AddSource(ServiceName)
                .AddAspNetCoreInstrumentation(options =>
                {
                    options.RecordException = true;
                    options.EnrichWithHttpRequest = (activity, request) =>
                    {
                        var contentLength = request.Headers.ContentLength;
                        if (contentLength.HasValue)
                        {
                            activity.SetTag("inbound.http.request.body.size", contentLength.Value);
                        }
                        else
                        {
                            activity.SetTag("inbound.http.request.body.size", "no content");
                        }
                        // activity.EnrichWithUser(request.HttpContext);
                    };
                    options.EnrichWithHttpResponse = (activity, response) =>
                    {
                        var contentLength = response.Headers.ContentLength;
                        if (contentLength.HasValue)
                        {
                            activity.SetTag("inbound.http.response.body.size", contentLength.Value);
                        }
                        else
                        {
                            activity.SetTag("inbound.http.response.body.size", "no content");
                        }
                        // activity.EnrichWithUser(response.HttpContext);
                    };
                })
                .AddHttpClientInstrumentation(options =>
                {
                    options.EnrichWithHttpRequestMessage = (activity, request) =>
                    {
                        var contentLength = request.Content?.Headers.ContentLength;
                        if (contentLength.HasValue)
                        {
                            activity.SetTag("outbound.http.request.body.size", contentLength.Value);
                        }
                        else
                        {
                            activity.SetTag("outbound.http.request.body.size", "no content");
                        }

                        if (request.RequestUri is not null)
                        {
                            activity.SetTag("url.path", request.RequestUri.AbsolutePath);
                            if (!string.IsNullOrEmpty(request.RequestUri.Query))
                                activity.SetTag("url.query", request.RequestUri.Query);
                        }
                        else
                        {
                            activity.SetTag("outbound.http.response.body.size", "no content");
                        }

                        // await GetLocationInfo(activity);
                    };
                    options.EnrichWithHttpResponseMessage = (activity, response) =>
                    {
                        var contentLength = response.Content.Headers.ContentLength;
                        if (contentLength.HasValue)
                        {
                            activity.SetTag("outbound.http.response.body.size", contentLength.Value);
                        }
                    };
                })
                    // .AddSource("MongoDB.Driver.Core.Extensions.DiagnosticSources")
                    .AddConsoleExporter()
                    .AddOtlpExporter()
            );

            // var meter = new Meter(ServiceName);
            // // var counter = meter.CreateCounter<int>("words-created");
            // services.AddOpenTelemetry().WithMetrics(metricProviderBuilder => metricProviderBuilder
            //     .SetResourceBuilder(appResourceBuilder)
            //     .AddMeter(meter.Name)
            //     .AddAspNetCoreInstrumentation()
            //     .AddHttpClientInstrumentation()
            //     .AddConsoleExporter()
            //     .AddOtlpExporter()
            // );

            // services.AddHttpContextAccessor();
            // await RecordLocationAsync(new HttpContextAccessor());
            var meter = new Meter(ServiceName);

        }

        private async Task GetLocationInfo(Activity activity)
        {
            var response = await _locationCache.GetLocation();

            var location = new
            {
                Country = response?.country,
                Region = response?.regionName,
                City = response?.city,
            };


            activity?.AddTag("country", location.Country);
            activity?.AddTag("region", location.Region);
            activity?.AddTag("city", location.City);

        }


        // private void EnrichWithUser(this Activity activity, HttpContext httpContext)
        // {
        //     var claimsPrincipal = httpContext.User;
        //     // var userId = claimsPrincipal?.FindFirstValue("sub");
        //     var userId = claimsPrincipal;
        //     if (userId != null)
        //     {
        //         activity.SetTag("app.user.id", userId);
        //     }
        //     var userRole = claimsPrincipal?.FindFirstValue("role");
        //     if (userRole != null)
        //     {
        //         activity.SetTag("app.user.role", userRole);
        //     }
        //     if (httpContext.RequestAborted.IsCancellationRequested)
        //     {
        //         activity.SetTag("http.abort", true);
        //     }
        // }
    }
}
