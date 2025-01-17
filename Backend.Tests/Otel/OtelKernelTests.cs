using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using Backend.Tests.Mocks;
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
            httpContext.Request.Headers[FrontendConsent] = "true";
            httpContext.Request.Headers[FrontendSessionId] = "123";
            var activity = new Activity("testActivity").Start();

            // Act
            TrackConsent(activity, httpContext.Request);
            TrackSession(activity, httpContext.Request);

            // Assert
            Assert.That(activity.Baggage.Any(_ => _.Key == OtelConsentBaggage));
            Assert.That(activity.Baggage.Any(_ => _.Key == OtelSessionBaggage));
        }

        [Test]
        public void BuildersSetBaggageFromHeaderNecessaryAnalytics()
        {
            // Arrange
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers[FrontendConsent] = "false";
            var activity = new Activity("testActivity").Start();

            // Act
            TrackConsent(activity, httpContext.Request);
            TrackSession(activity, httpContext.Request);

            // Assert
            Assert.That(activity.Baggage.Any(_ => _.Key == OtelConsentBaggage));
            Assert.That(!activity.Baggage.Any(_ => _.Key == OtelSessionBaggage));
        }

        [Test]
        public void OnEndSetsTagsFromBaggage()
        {
            // Arrange
            var activity = new Activity("testActivity").Start();
            activity.SetBaggage(OtelConsentBaggage, "true");
            activity.SetBaggage(OtelSessionBaggage, "test session id");

            // Act
            _locationEnricher.OnEnd(activity);

            // Assert
            Assert.That(activity.Tags.Any(_ => _.Key == OtelConsent));
            Assert.That(activity.Tags.Any(_ => _.Key == OtelSessionId));
        }

        [Test]
        public void OnEndSetsLocationTagsAllAnalytics()
        {
            // Arrange
            _locationEnricher = new LocationEnricher(new LocationProviderMock());
            var activity = new Activity("testActivity").Start();
            activity.SetBaggage(OtelConsentBaggage, "true");

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
            activity.SetBaggage(OtelConsentBaggage, "false");

            // Act
            _locationEnricher.OnEnd(activity);

            // Assert
            Assert.That(!activity.Tags.Any(_ => _.Key == "country"));
            Assert.That(!activity.Tags.Any(_ => _.Key == "regionName"));
            Assert.That(!activity.Tags.Any(_ => _.Key == "city"));
        }
    }
}
