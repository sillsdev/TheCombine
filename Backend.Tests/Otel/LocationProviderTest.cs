using System.Drawing;
using System.Net;
using System.Net.Http;
using System.Runtime;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using Backend.Tests.Mocks;
using BackendFramework.Otel;
using Grpc.Net.Client.Balancer;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using NUnit.Framework;
using Org.BouncyCastle.Crypto.Operators;

namespace Backend.Tests.Otel
{
    public class LocationProviderTests
    {
        public const string locationGetterUri = "http://ip-api.com/json/";
        private IHttpContextAccessor? _contextAccessor;
        private IMemoryCache? _memoryCache;
        private IHttpClientFactory? _httpClientFactory;
        private LocationProvider? _locationProvider;

        [SetUp]
        public void Setup()
        {
            // _contextAccessor = new HttpContextAccessor();
            _contextAccessor = new HttpContextAccessor();
            _memoryCache = null;
            _httpClientFactory = new HttpClientFactoryMock();
            _locationProvider = new LocationProvider(_contextAccessor, _memoryCache, _httpClientFactory);

        }

        [Test]
        public void TestGetLocation()
        {
            var httpContext = new DefaultHttpContext()
            {
                Connection =
                {
                    RemoteIpAddress = new IPAddress(100000)
                }

            };
            if (_contextAccessor != null)
            {
                _contextAccessor.HttpContext = httpContext;
            }
            // context.Request.Headers.

            // _contextAccessor.HttpContext.


        }

        public void TestGetLocationFromIp()
        {
            // TODO need to mock the http call (do not make actually httpcall)
            // need to figure out what the mock returns
            var testIp = "100.0.0.0";
            var location = _locationProvider?.GetLocationFromIp(testIp);

            Assert.That(location, Is.Not.Null);

            // LocationApi correctLocation = new LocationApi()
            // {
            //     status = "success",
            //     country = "United States",
            //     regionName = "Massachusetts",
            //     city = "Tewksbury"
            // };
            // Assert.That 
            _httpClientFactory
        }


        public void TestGetLocationUsesCache()
        {

        }

        // [Test]
        // public void TestGetLocationWithCaching()
        // {
        //     // create a mock context with a set IP
        //     var httpContext = new DefaultHttpContext();


        //     // call GetLocation() 


        // }

        // [Test]
        // public void TestGetLocationFromIp()
        // {
        //     var ipAddressWithoutPort = "100.0.0.0";

        //     // how to set up locationProvider
        //     var location = _locationProvider.GetLocationFromIp(ipAddressWithoutPort);

        //     // ideally, would create a locationAPI and check that values match
        //     // (but that would also then be quite dependent on implementation, 
        //     // e.g. which fields we are returning)
        //     Assert.That(location, Is.Not.Null);

        // }
    }
}
