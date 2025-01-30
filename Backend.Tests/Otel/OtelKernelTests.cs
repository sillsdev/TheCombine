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
        public void BuildersSetBaggageFromHeaderAllAnalytics()
        {
            // Arrange
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers[AnalyticsOnHeader] = "true";
            httpContext.Request.Headers[SessionIdHeader] = "123";
            var activity = new Activity("testActivity").Start();

            // Act
            TrackConsent(activity, httpContext.Request);
            TrackSession(activity, httpContext.Request);

            // Assert
            Assert.That(activity.Baggage.Any(_ => _.Key == ConsentBaggage));
            Assert.That(activity.Baggage.Any(_ => _.Key == SessionIdBaggage));
        }

        [Test]
        public void BuildersSetBaggageFromHeaderNecessaryAnalytics()
        {
            // Arrange
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers[AnalyticsOnHeader] = "false";
            var activity = new Activity("testActivity").Start();

            // Act
            TrackConsent(activity, httpContext.Request);
            TrackSession(activity, httpContext.Request);

            // Assert
            Assert.That(activity.Baggage.Any(_ => _.Key == ConsentBaggage));
            Assert.That(!activity.Baggage.Any(_ => _.Key == SessionIdBaggage));
        }

        [Test]
        public void OnEndSetsTagsFromBaggage()
        {
            // Arrange
            var activity = new Activity("testActivity").Start();
            activity.SetBaggage(ConsentBaggage, "true");
            activity.SetBaggage(SessionIdBaggage, "test session id");

            // Act
            _locationEnricher.OnEnd(activity);

            // Assert
            Assert.That(activity.Tags.Any(_ => _.Key == ConsentTag));
            Assert.That(activity.Tags.Any(_ => _.Key == SessionIdTag));
        }

        [Test]
        public void OnEndSetsLocationTagsAllAnalytics()
        {
            // Arrange
            _locationEnricher = new LocationEnricher(new LocationProviderMock());
            var activity = new Activity("testActivity").Start();
            activity.SetBaggage(ConsentBaggage, "true");

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
        public void OnEndSetsLocationTagsNecessaryAnalytics()
        {
            // Arrange
            _locationEnricher = new LocationEnricher(new LocationProviderMock());
            var activity = new Activity("testActivity").Start();
            activity.SetBaggage(ConsentBaggage, "false");

            // Act
            _locationEnricher.OnEnd(activity);

            // Assert
            Assert.That(!activity.Tags.Any(_ => _.Key == "country"));
            Assert.That(!activity.Tags.Any(_ => _.Key == "regionName"));
            Assert.That(!activity.Tags.Any(_ => _.Key == "city"));
        }

        [Test]
        public void OnEndRedactsIp()
        {
            // Arrange
            _locationEnricher = new LocationEnricher(new LocationProviderMock());
            var activity = new Activity("testActivity").Start();
            activity.SetBaggage(ConsentBaggage, "true");
            activity.SetTag("url.full", $"{LocationProvider.locationGetterUri}100.0.0.0");

            // Act
            _locationEnricher.OnEnd(activity);

            // Assert
            Assert.That(activity.Tags.Any(_ => _.Key == "url.full" && _.Value == ""));
            Assert.That(activity.Tags.Any(_ => _.Key == "url.redacted.ip" && _.Value == LocationProvider.locationGetterUri));
        }
    }
}
