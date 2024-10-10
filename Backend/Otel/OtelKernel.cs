// using System.Diagnostics;
// using BackendFramework.Interfaces;
using System.Diagnostics.CodeAnalysis;
using Microsoft.Extensions.DependencyInjection;
// using OpenTelemetry;
using OpenTelemetry.Instrumentation.AspNetCore;
using OpenTelemetry.Instrumentation.Http;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using System.Linq;
using OpenTelemetry;
using System.Diagnostics;
// using BackendFramework.Otel;
namespace BackendFramework.Otel
{
    public static class OtelKernel
    {
        public const string SourceName = "Backend-Otel";
        [ExcludeFromCodeCoverage]
        private static void AspNetCoreBuilder(AspNetCoreTraceInstrumentationOptions options)
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
                string? sessionId = request.Headers.TryGetValue("sessionId", out var values) ? values.FirstOrDefault() : null;
                if (sessionId != null)
                {
                    // activity.SetTag("sessionId", sessionId);
                    activity.SetBaggage("sessionId", sessionId);
                }
                else
                {
                    activity.SetTag("sessionId", "NULL");
                    // activity.SetBaggage("sessionId", "NULL");
                }
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
                string? sessionId = response.Headers.TryGetValue("sessionId", out var values) ? values.FirstOrDefault() : null;
                if (sessionId != null)
                {
                    // activity.SetTag("sessionId", sessionId);
                    activity.SetBaggage("sessionId", sessionId);
                }
                else
                {
                    activity.SetTag("sessionId", "NULL");
                    // activity.SetBaggage("sessionId", "NULL");
                }
            };
        }
        [ExcludeFromCodeCoverage]
        private static void HttpClientBuilder(HttpClientTraceInstrumentationOptions options)
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
                    activity.SetTag("url.pathHERE", request.RequestUri.AbsolutePath);
                    if (!string.IsNullOrEmpty(request.RequestUri.Query))
                        activity.SetTag("url.query", request.RequestUri.Query);
                }
                else
                {
                    activity.SetTag("outbound.http.response.body.size", "no content");
                }
                string? sessionId = request.Headers.TryGetValues("sessionId", out var values) ? values.FirstOrDefault() : null;
                if (sessionId != null)
                {
                    // activity.SetTag("sessionId", sessionId);
                    activity.SetBaggage("sessionId", sessionId);
                }
                else
                {
                    activity.SetTag("sessionId", "NULL");
                    // activity.SetBaggage("sessionId", "NULL");
                }
            };
            options.EnrichWithHttpResponseMessage = (activity, response) =>
            {
                var contentLength = response.Content.Headers.ContentLength;
                if (contentLength.HasValue)
                {
                    activity.SetTag("outbound.http.response.body.size", contentLength.Value);
                }
                string? sessionId = response.Headers.TryGetValues("sessionId", out var values) ? values.FirstOrDefault() : null;
                if (sessionId != null)
                {
                    // activity.SetTag("sessionId", sessionId);
                    activity.SetBaggage("sessionId", sessionId);
                }
                else
                {
                    activity.SetTag("sessionId", "NULL");
                    // activity.SetBaggage("sessionId", "NULL");
                }
            };
        }
        public static void AddOpenTelemetryInstrumentation(this IServiceCollection services)
        {
            var appResourceBuilder = ResourceBuilder.CreateDefault();
            // todo: include version 
            services.AddOpenTelemetry().WithTracing(tracerProviderBuilder => tracerProviderBuilder
            .SetResourceBuilder(appResourceBuilder)
            .AddSource(SourceName)
            // .AddProcessor<LocationEnricher>()
            .AddAspNetCoreInstrumentation(AspNetCoreBuilder)
            .AddHttpClientInstrumentation(HttpClientBuilder)
            .AddConsoleExporter()
            .AddOtlpExporter()
            );
        }
        private class UserEnricher() : BaseProcessor<Activity>
        {
            public override void OnStart(Activity data)
            {
            }
        }
    }
}

