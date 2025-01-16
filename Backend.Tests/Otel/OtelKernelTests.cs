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
        public void BuildersSetBaggageFromHeader()
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
        public void OnEndSetsTagsFromBaggage()
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
    }
}
