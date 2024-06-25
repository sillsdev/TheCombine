using System;
using System.Diagnostics;
// using System.Diagnostics.Metrics;
using System.Net.Http;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;


namespace BackendFramework.Otel
{

    public static class OtelKernel
    {

        public const string ServiceName = "Backend-Otel";
        public static async void AddOpenTelemetryInstrumentation(this IServiceCollection services)
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
                        activity.EnrichWithUser(request.HttpContext);
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
                        activity.EnrichWithUser(response.HttpContext);
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

            services.AddHttpContextAccessor();
            await RecordLocationAsync(new HttpContextAccessor());
        }

        private static async Task RecordLocationAsync(IHttpContextAccessor contextAccessor)
        {
            using (var activity = BackendActivitySource.Get().StartActivity())
            {
                activity?.AddTag("where", "in kernel");
                if (contextAccessor.HttpContext is { } context)
                {
                    try
                    {
                        var ipAddress = context.GetServerVariable("HTTP_X_FORWARDED_FOR") ?? context.Connection.RemoteIpAddress?.ToString();
                        var ipAddressWithoutPort = ipAddress?.Split(':')[0];

                        var route = $"http://ip-api.com/json/{ipAddressWithoutPort}";

                        var httpClient = new HttpClient();
                        var response = await httpClient.GetFromJsonAsync<LocationApi>(route);

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
                    catch (Exception e)
                    {
                        activity?.SetTag("Location Exception", e.Message);
                    }
                }
            }
        }


        private static void EnrichWithUser(this Activity activity, HttpContext httpContext)
        {
            var claimsPrincipal = httpContext.User;
            // var userId = claimsPrincipal?.FindFirstValue("sub");
            var userId = claimsPrincipal;
            if (userId != null)
            {
                activity.SetTag("app.user.id", userId);
            }
            var userRole = claimsPrincipal?.FindFirstValue("role");
            if (userRole != null)
            {
                activity.SetTag("app.user.role", userRole);
            }
            if (httpContext.RequestAborted.IsCancellationRequested)
            {
                activity.SetTag("http.abort", true);
            }
        }
    }
}
