
// using System.Reflection.PortableExecutable;
using System.Diagnostics;
using System.Diagnostics.Metrics;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using OpenTelemetry.Metrics;

// using OpenTelemetry.Logs;
// using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
// using SIL.WritingSystems;
// using OpenTelemetry.Exporter;


namespace BackendFramework.Otel;

public static class OtelKernel
{

    public const string ServiceName = "Backend-Otel";
    public static void AddOpenTelemetryInstrumentation(this IServiceCollection services)
    {
        var appResourceBuilder = ResourceBuilder.CreateDefault().AddService(ServiceName);
        // todo: include version 
        services.AddOpenTelemetry().WithTracing(tracerProviderBuilder => tracerProviderBuilder
                    .SetResourceBuilder(appResourceBuilder)
                    .AddSource(ServiceName)
                    // .AddProcessor<UserEnricher>()
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

        var meter = new Meter(ServiceName);
        var counter = meter.CreateUpDownCounter<int>("word-count");
        services.AddOpenTelemetry().WithMetrics(metricProviderBuilder => metricProviderBuilder
            .SetResourceBuilder(appResourceBuilder)
            .AddMeter(meter.Name)
            .AddConsoleExporter()
            .AddOtlpExporter()
            );
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
