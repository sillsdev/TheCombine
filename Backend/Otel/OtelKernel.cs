using System.Diagnostics;
using BackendFramework.Interfaces;
using System.Diagnostics.CodeAnalysis;
using Microsoft.Extensions.DependencyInjection;
using OpenTelemetry;
using OpenTelemetry.Instrumentation.AspNetCore;
using OpenTelemetry.Instrumentation.Http;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using System.Linq;
using Microsoft.AspNetCore.Http;
// using System.Net.Http;
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
                // GetContentLength(activity, request.Headers, "inbound.http.request.body.size");
                AddSession(activity, request);
            };
            options.EnrichWithHttpResponse = (activity, response) =>
            {
                // GetContentLength(activity, response.Headers, "inbound.http.response.body.size");
                // AddSession(activity, response);
            };
        }
        [ExcludeFromCodeCoverage]
        private static void HttpClientBuilder(HttpClientTraceInstrumentationOptions options)
        {
            options.EnrichWithHttpRequestMessage = (activity, request) =>
            {
                // GetContentLength(activity, request.Headers, "outbound.http.request.body.size");
                if (request.RequestUri is not null)
                {
                    if (!string.IsNullOrEmpty(request.RequestUri.Query))
                        activity.SetTag("url.query", request.RequestUri.Query);
                }
                // AddSession(activity, request);
            };
            options.EnrichWithHttpResponseMessage = (activity, response) =>
            {
                // GetContentLength(activity, response.Headers, "outbound.http.response.body.size");
                // AddSession(activity, response);
            };
        }

        internal static void AddSession(Activity activity, HttpRequest request)
        {
            // var header = (HeaderDictionary)headers;
            string? sessionId = request.Headers.TryGetValue("sessionId", out var values) ? values.FirstOrDefault() : null;
            if (sessionId != null)
            {
                activity.SetBaggage("sessionId", sessionId);
            }
        }

        internal static void GetContentLength(Activity activity, object headers, string label)
        {
            var header = (HeaderDictionary)headers;
            var contentLength = header.ContentLength;
            if (contentLength.HasValue)
            {
                activity.SetTag(label, contentLength.Value);
            }
        }

        public static void AddOpenTelemetryInstrumentation(this IServiceCollection services)
        {
            var appResourceBuilder = ResourceBuilder.CreateDefault();
            // todo: include version 
            services.AddOpenTelemetry().WithTracing(tracerProviderBuilder => tracerProviderBuilder
            .SetResourceBuilder(appResourceBuilder)
            .AddSource(SourceName)
            .AddProcessor<LocationEnricher>()
            .AddAspNetCoreInstrumentation(AspNetCoreBuilder)
            .AddHttpClientInstrumentation(HttpClientBuilder)
            .AddConsoleExporter()
            .AddOtlpExporter()
            );
        }

        internal class LocationEnricher(ILocationProvider locationProvider) : BaseProcessor<Activity>
        {
            public override async void OnEnd(Activity data)
            {
                string? uriPath = (string?)data.GetTagItem("url.full");
                string locationUri = LocationProvider.locationGetterUri;
                if (uriPath == null || !uriPath.Contains(locationUri))
                {
                    LocationApi? response = await locationProvider.GetLocation();
                    var location = new
                    {
                        Country = response?.country,
                        Region = response?.regionName,
                        City = response?.city,
                    };
                    data?.AddTag("country", location.Country);
                    data?.AddTag("region", location.Region);
                    data?.AddTag("city", location.City);
                }
                data?.SetTag("SESSIONID BAGGAGE", data?.GetBaggageItem("sessionId"));
                if (uriPath != null && uriPath.Contains(locationUri))
                {
                    data?.SetTag("url.full", "");
                    data?.SetTag("url.redacted.ip", LocationProvider.locationGetterUri);
                }
            }
        }
    }
}

