using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using Backend.Tests.Mocks;
using BackendFramework.Otel;
using Microsoft.AspNetCore.Http;
using NUnit.Framework;
using static BackendFramework.Otel.OtelKernel;

namespace Backend.Tests.Otel
{
    public class OtelKernelTests : IDisposable
    {

        private const string FrontendConsentKey = "otelConsent";
        private const string FrontendSessionIdKey = "sessionId";
        private const string OtelConsentKey = "otelConsent";
        private const string OtelSessionIdKey = "sessionId";
        private const string OtelConsentBaggageKey = "otelConsentBaggage";
        private const string OtelSessionBaggageKey = "sessionBaggage";

        private LocationEnricher _locationEnricher = null!;

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (disposing)
            {
                _locationEnricher?.Dispose();
            }
        }

        [Test]
        public void BuildersSetConsentAndSessionBaggageFromHeader()
        {
            // Arrange
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers[FrontendConsentKey] = "true";
            httpContext.Request.Headers[FrontendSessionIdKey] = "123";
            var activity = new Activity("testActivity").Start();

            // Act
            TrackConsent(activity, httpContext.Request);
            TrackSession(activity, httpContext.Request);

            // Assert
            Assert.That(activity.Baggage.Any(_ => _.Key == OtelConsentBaggageKey));
            Assert.That(activity.Baggage.Any(_ => _.Key == OtelSessionBaggageKey));
        }

        [Test]
        public void OnEndSetsConsentAndSessionTagFromBaggage()
        {
            // Arrange
            var activity = new Activity("testActivity").Start();
            activity.SetBaggage(OtelConsentBaggageKey, "true");
            activity.SetBaggage(OtelSessionBaggageKey, "test session id");

            // Act
            _locationEnricher.OnEnd(activity);

            // Assert
            Assert.That(activity.Tags.Any(_ => _.Key == OtelConsentKey));
            Assert.That(activity.Tags.Any(_ => _.Key == OtelSessionIdKey));
        }

        [Test]
        public void OnEndSetsLocationTags()
        {
            // Arrange
            _locationEnricher = new LocationEnricher(new LocationProviderMock());
            var activity = new Activity("testActivity").Start();
            activity.SetBaggage(OtelConsentBaggageKey, "true");

            // Act
            _locationEnricher.OnEnd(activity);

            // Assert
            var testLocation = new Dictionary<string, string>
            {
                {"country", "test country"},
                {"regionName", "test region"},
                {"city", "city"}
            };
            Assert.That(activity.Tags, Is.SupersetOf(testLocation));
        }

        [Test]
        public void OnEndRedactsIp()
        {
            // Arrange
            _locationEnricher = new LocationEnricher(new LocationProviderMock());
            var activity = new Activity("testActivity").Start();
            activity.SetBaggage(OtelConsentBaggageKey, "true");
            activity.SetTag("url.full", $"{LocationProvider.locationGetterUri}100.0.0.0");

            // Act
            _locationEnricher.OnEnd(activity);

            // Assert
            Assert.That(activity.Tags.Any(_ => _.Key == "url.full" && _.Value == ""));
            Assert.That(activity.Tags.Any(_ => _.Key == "url.redacted.ip" && _.Value == LocationProvider.locationGetterUri));
        }
    }
}
