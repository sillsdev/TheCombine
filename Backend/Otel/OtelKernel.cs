
// using System;
using System.Diagnostics;
using BackendFramework.Interfaces;

using System.Diagnostics.CodeAnalysis;
// using System.Diagnostics.Metrics;
// using System.Net.Http;
// using System.Net.Http.Json;
// using System.Security.Claims;
// using System.Threading.Tasks;
// using Microsoft.AspNetCore.Http;
// using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using OpenTelemetry;
using OpenTelemetry.Instrumentation.AspNetCore;
using OpenTelemetry.Instrumentation.Http;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
// using System.Collections.Generic;
using System.Linq;
// using Microsoft.AspNetCore.Http;

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

                if (request.Headers.ContainsKey("sessionId"))
                {
                    activity.SetTag("ID EXISTS asp", "TRUE");
                }
                string? theId = request.Headers.TryGetValue("sessionId", out var values) ? values.FirstOrDefault() : null;
                if (theId != null)
                {
                    activity.SetTag("ID IS asp", theId);
                }
                // activity.EnrichWithUser(request.HttpContext);
                activity.SetTag("BEFORE", "inasp-request");
                var sessionContext = request.HttpContext;
                activity.SetTag("context", sessionContext);
                activity.SetTag("AFTER", "inasp-request");
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
                activity.SetTag("BEFORE", "inasp-response");
                // var sessionId = response.HttpContext;
                var sessionContext = response.HttpContext;
                activity.SetTag("context", sessionContext);
                activity.SetTag("AFTER", "inasp-response");
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
                activity.SetTag("BEFORE", "inhttp-request");
                // var sessionId = response.HttpContext;
                var sessionContext = request.Headers.Connection;
                activity.SetTag("context", sessionContext);
                activity.SetTag("AFTER", "inhttp-request");
            };
            options.EnrichWithHttpResponseMessage = (activity, response) =>
            {
                var contentLength = response.Content.Headers.ContentLength;
                if (contentLength.HasValue)
                {
                    activity.SetTag("outbound.http.response.body.size", contentLength.Value);
                }
                if (response.Headers.Contains("sessionId"))
                {
                    activity.SetTag("ID EXISTS http", "TRUE");
                }
                // IEnumerable<string> values;
                string? theId = response.Headers.TryGetValues("sessionId", out var values) ? values.FirstOrDefault() : null;
                if (theId != null)
                {
                    activity.SetTag("ID IS http", theId);
                }
                activity.SetTag("BEFORE", "inhttp-response");
                // var sessionId = response.HttpContext;
                var sessionContext = response.Headers.Connection;
                activity.SetTag("context", sessionContext);
                activity.SetTag("AFTER", "inhttp-response");
            };
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
                // .AddSource("MongoDB.Driver.Core.Extensions.DiagnosticSources")
                .AddConsoleExporter()
                .AddOtlpExporter()
            );

        }

        // private static void EnrichWithUser(this Activity activity, HttpContext httpContext)
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

        private class LocationEnricher(ILocationProvider locationProvider) : BaseProcessor<Activity>
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

            }
        }
    }

}

