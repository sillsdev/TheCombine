using System.Diagnostics;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Net.Http;
using BackendFramework.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using OpenTelemetry;
using OpenTelemetry.Instrumentation.AspNetCore;
using OpenTelemetry.Instrumentation.Http;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

namespace BackendFramework.Otel
{
    public static class OtelKernel
    {
        public const string SourceName = "Backend-Otel";
        public const string FrontendConsent = "otelConsent";
        public const string FrontendSessionId = "sessionId";
        public const string OtelConsent = "otelConsent";
        public const string OtelSessionId = "sessionId";
        public const string OtelConsentBaggage = "otelConsentBaggage";
        public const string OtelSessionBaggage = "sessionBaggage";

        public static void AddOpenTelemetryInstrumentation(this IServiceCollection services)
        {
            var appResourceBuilder = ResourceBuilder.CreateDefault();
            services.AddOpenTelemetry().WithTracing(tracerProviderBuilder =>
                tracerProviderBuilder
                    .SetResourceBuilder(appResourceBuilder)
                    .AddSource(SourceName)
                    .AddProcessor<LocationEnricher>()
                    .AddAspNetCoreInstrumentation(AspNetCoreBuilder)
                    .AddHttpClientInstrumentation(HttpClientBuilder)
                    .AddConsoleExporter()
                    .AddOtlpExporter()
            );
        }

        internal static void TrackConsent(Activity activity, HttpRequest request)
        {
            var consent = request.Headers.TryGetValue("otelConsent", out var valueString)
                ? (bool.TryParse(valueString.FirstOrDefault(), out bool valueBool) && valueBool)
                : true;
            if (string.IsNullOrEmpty(valueString))
            {
                activity.SetTag("consent string is null", "!");

            }
            activity.SetTag("consent string", valueString.ToString());
            activity.SetBaggage(OtelConsentBaggage, consent.ToString());
        }

        internal static void TrackSession(Activity activity, HttpRequest request)
        {
            var sessionId = request.Headers.TryGetValue(FrontendSessionId, out var values) ? values.FirstOrDefault() : null;
            if (sessionId is not null)
            {
                activity.SetBaggage(OtelSessionBaggage, sessionId);
            }
        }

        internal static void GetContentLengthAspNet(Activity activity, IHeaderDictionary headers, string label)
        {
            var contentLength = headers.ContentLength;
            if (contentLength.HasValue)
            {
                activity.SetTag(label, contentLength.Value);
            }
        }

        internal static void GetContentLengthHttp(Activity activity, HttpContent? content, string label)
        {
            var contentLength = content?.Headers.ContentLength;
            if (contentLength.HasValue)
            {
                activity.SetTag(label, contentLength.Value);
            }
        }

        [ExcludeFromCodeCoverage]
        private static void AspNetCoreBuilder(AspNetCoreTraceInstrumentationOptions options)
        {
            options.RecordException = true;
            options.EnrichWithHttpRequest = (activity, request) =>
            {
                GetContentLengthAspNet(activity, request.Headers, "inbound.http.request.body.size");
                TrackConsent(activity, request);
                TrackSession(activity, request);
            };
            options.EnrichWithHttpResponse = (activity, response) =>
            {
                GetContentLengthAspNet(activity, response.Headers, "inbound.http.response.body.size");
            };
        }
        [ExcludeFromCodeCoverage]
        private static void HttpClientBuilder(HttpClientTraceInstrumentationOptions options)
        {
            options.EnrichWithHttpRequestMessage = (activity, request) =>
            {
                GetContentLengthHttp(activity, request.Content, "outbound.http.request.body.size");
                if (request.RequestUri is not null)
                {
                    if (!string.IsNullOrEmpty(request.RequestUri.Query))
                    {
                        activity.SetTag("url.query", request.RequestUri.Query);
                    }
                }
            };
            options.EnrichWithHttpResponseMessage = (activity, response) =>
            {
                GetContentLengthHttp(activity, response.Content, "outbound.http.response.body.size");
            };
        }

        internal class LocationEnricher(ILocationProvider locationProvider) : BaseProcessor<Activity>
        {
            public override async void OnEnd(Activity data)
            {
                var consentString = data.GetBaggageItem(OtelConsentBaggage);
                data.AddTag(OtelConsent, consentString);
                if (bool.TryParse(consentString, out bool consent) && consent)
                {
                    var uriPath = (string?)data.GetTagItem("url.full");
                    var locationUri = LocationProvider.locationGetterUri;
                    if (uriPath is null || !uriPath.Contains(locationUri))
                    {
                        var location = await locationProvider.GetLocation();
                        data.AddTag("country", location?.Country);
                        data.AddTag("regionName", location?.RegionName);
                        data.AddTag("city", location?.City);
                    }
                    data.AddTag(OtelSessionId, data?.GetBaggageItem("sessionBaggage"));
                }
            }
        }
    }
}

