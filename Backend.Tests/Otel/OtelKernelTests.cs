using System;
using System.Collections.Generic;

// using System.Collections.Generic;
using System.Diagnostics;
// using System.Linq;
using Backend.Tests.Mocks;
using BackendFramework.Interfaces;
// using BackendFramework.Otel;
// using Microsoft.Extensions.DependencyInjection;

// using BackendFramework.Otel;
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

        [SetUp]
        public void Setup()
        {
            _locationProvider = new LocationProviderMock();
            _locationEnricher = new LocationEnricher(_locationProvider);


        }

        // public void TestSessionIdIsTag()
        // {

        //     var activity = new Activity("testActivity").Start();
        //     var services = new ServiceCollection();
        //     OtelService.AddOtelInstrumentation(services);
        //     var tags = activity.Tags;
        //     Assert.That(tags, Is.Not.Null);
        //     var testId = new Dictionary<string, string> {
        //         {"sessionnnaId", "123"}
        //     };
        //     List<KeyValuePair<string, string?>> list = (List<KeyValuePair<string, string?>>)tags;
        //     foreach (var x in tags)
        //     {
        //         Console.WriteLine(x);
        //     }
        //     Assert.That(tags, Is.SupersetOf(testId));


        // }

        [Test]
        public void TestOnEndLocation()
        {
            // mock activity
            var activity = new Activity("testActivity").Start();
            _locationEnricher.OnEnd(activity);
            var tags = activity.Tags;
            Assert.That(tags, Is.Not.Null);
            // List<KeyValuePair<string, string?>> list = (List<KeyValuePair<string, string?>>)tags;
            // foreach (var x in tags)
            // {
            //     Console.WriteLine(x);
            // }
            var testLocation = new Dictionary<string, string>
            {
                {"country", "test country"},
                {"regionName", "test region"},
                {"city", "city"}
            };

            // Assert.That(tags.Any(item => item == [test country]));
            Assert.That(tags, Is.SupersetOf(testLocation));

        }

        [Test]
        public void TestOnEndSession()
        {
            // mock activity
            var activity = new Activity("testActivity").Start();

            _locationEnricher.OnEnd(activity);
            var tags = activity.Tags;
            Assert.That(tags, Is.Not.Null);
            // List<KeyValuePair<string, string?>> list = (List<KeyValuePair<string, string?>>)tags;
            // foreach (var x in tags)
            // {
            //     Console.WriteLine(x);
            // }
            var testLocation = new Dictionary<string, string>
            {
                {"sessionId", "123"},
            };

            // Assert.That(tags.Any(item => item == [test country]));
            Assert.That(tags, Is.SupersetOf(testLocation));

        }
    }
}