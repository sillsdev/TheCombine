
using System;
using System.Diagnostics;
using System.Diagnostics.Metrics;
using System.Net.Http;
using System.Net.Http.Json;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using OpenTelemetry;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

namespace BackendFramework.Otel
{

    public static class OtelKernel
    {

        public const string ServiceName = "Backend-Otel";
        // private readonly LocationCache _locationCache;

        // public OtelKernel(LocationCache locationCache, IServiceCollection serviceCollection)
        // {
        //     _locationCache = locationCache;
        //     AddOpenTelemetryInstrumentation(serviceCollection);
        // }

        public static void AddOpenTelemetryInstrumentation(this IServiceCollection services)
        {
            var appResourceBuilder = ResourceBuilder.CreateDefault().AddService(ServiceName);
            // todo: include version 
            services.AddOpenTelemetry().WithTracing(tracerProviderBuilder => tracerProviderBuilder
                .SetResourceBuilder(appResourceBuilder)
                .AddSource(ServiceName)
                .AddProcessor<LocationEnricher>()
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

                        // await GetLocation(activity);
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

            var meter = new Meter(ServiceName);

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


        private class LocationEnricher(IHttpContextAccessor contextAccessor, IMemoryCache memoryCache) : BaseProcessor<Activity>
        {
            public override async void OnStart(Activity data)
            {
                data?.SetTag("inonstart", "here!");
                if (contextAccessor.HttpContext is { } context)
                {
                    var ipAddress = context.GetServerVariable("HTTP_X_FORWARDED_FOR") ?? context.Connection.RemoteIpAddress?.ToString();
                    var ipAddressWithoutPort = ipAddress?.Split(':')[0];

                    LocationApi? response = await memoryCache.GetOrCreateAsync(
                    "location_" + ipAddressWithoutPort,
                    async (cacheEntry) =>
                    {
                        data?.SetTag("found in cache?", "no");

                        try
                        {
                            var route = $"http://ip-api.com/json/{ipAddressWithoutPort}";
                            var httpClient = new HttpClient();
                            var response = await httpClient.GetFromJsonAsync<LocationApi>(route);

                            return response;
                            // return new LocationApi { };

                        }
                        catch (Exception e)
                        {
                            // todo figure out what to put in catch 
                            data?.SetTag("Location Exception", e.Message);
                            Console.WriteLine("Attempted to get location but exception");
                        }


                        // return new LocationApi { };
                        return null;
                    });

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
