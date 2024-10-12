using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using Backend.Tests.Mocks;
using BackendFramework.Interfaces;
using Microsoft.AspNetCore.Http;
using NUnit.Framework;
using static BackendFramework.Otel.OtelKernel;

namespace Backend.Tests.Otel
{
    public class OtelKernelTests : IDisposable
    {
        private ILocationProvider _locationProvider = null!;
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
        public void BuildersSetSessionBaggageFromHeader()
        {

            // create mock request header
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["sessionId"] = "123";

            // call methods
            var activity = new Activity("testActivity").Start();

            TrackSession(activity, httpContext.Request);

            // check that the id was added as tag
            var baggage = activity.Baggage;
            Assert.That(baggage, Is.Not.Null);
            var testId = new Dictionary<string, string> {
                {"sessionId", "123"}
            };
            Assert.That(baggage.Any(tag => tag.Key == "sessionId"));
            Assert.That(baggage, Is.SupersetOf(testId));
        }

        [Test]
        public void OnEndSetsSessionTagFromBaggage()
        {
            // mock activity
            var activity = new Activity("testActivity").Start();
            activity.SetBaggage("sessionId", "test session id");

            _locationEnricher.OnEnd(activity);
            var tags = activity.Tags;
            Assert.That(tags, Is.Not.Null);

            var testLocation = new Dictionary<string, string>
            {
                {"sessionId", "test session id"},
            };

            // Assert.That(tags.Any(item => item == [test country]));
            Assert.That(tags, Is.SupersetOf(testLocation));
        }


        [Test]
        public void OnEndSetsLocationTags()
        {

            _locationProvider = new LocationProviderMock();
            _locationEnricher = new LocationEnricher(_locationProvider);
            // mock activity
            var activity = new Activity("testActivity").Start();
            _locationEnricher.OnEnd(activity);
            var tags = activity.Tags;
            Assert.That(tags, Is.Not.Null);

            var testLocation = new Dictionary<string, string>
            {
                {"country", "test country"},
                {"regionName", "test region"},
                {"city", "city"}
            };

            Assert.That(tags, Is.SupersetOf(testLocation));

        }

        public void OnEndRedactsIp()
        {

        }
    }
}
