using System;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
// using Backend.Tests.Mocks;
using BackendFramework.Otel;
// using Castle.Core.Internal;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
// using MongoDB.Driver;
using Moq;
using Moq.Protected;
using NUnit.Framework;

namespace Backend.Tests.Otel
{
    public class LocationProviderTests
    {
        public const string locationGetterUri = "http://ip-api.com/json/";
        private IHttpContextAccessor? _contextAccessor;
        private IMemoryCache? _memoryCache;
        private Mock<IHttpClientFactory>? _httpClientFactory;
        private LocationProvider? _locationProvider;

        private Mock<HttpMessageHandler>? _handlerMock;

        // private

        // private static void MemFunction()
        // {

        // }

        [SetUp]
        public void Setup()
        {
            // Set up HttpContextAccessor semi-mock
            _contextAccessor = new HttpContextAccessor();


            // _memoryCache = new Mock<IMemoryCache>();
            // _memoryCache
            //     .Setup(x => x.CreateEntry(It.IsAny<string>()))
            //     .Returns(Mock.Of<ICacheEntry>());

            // _memoryCache.Setup(x => x.GetOrCreateAsync(It.IsAny<string>(), MemFunction())).Returns("");

            // Set up MemoryCache
            var services = new ServiceCollection();
            services.AddMemoryCache();
            var serviceProvider = services.BuildServiceProvider();
            _memoryCache = serviceProvider.GetService<IMemoryCache>();


            // Set up HttpClientFactory mock
            _handlerMock = new Mock<HttpMessageHandler>();
            _handlerMock.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>()
            )
            .ReturnsAsync(new HttpResponseMessage()
            {
                StatusCode = HttpStatusCode.OK,
                Content = null,
            }
            )
            .Verifiable();
            var httpClient = new HttpClient(_handlerMock.Object)
            {
                BaseAddress = new Uri("https://abc.sample.xyz/")
            };
            _httpClientFactory = new Mock<IHttpClientFactory>();
            _httpClientFactory
                .Setup(x => x.CreateClient(It.IsAny<string>()))
                .Returns(httpClient);






            _locationProvider = new LocationProvider(_contextAccessor, _memoryCache!, _httpClientFactory.Object);

        }

        public static void Verify(Mock<HttpMessageHandler> mock, Func<HttpRequestMessage, bool> match)
        {
            // Console.WriteLine(mock.get);

            mock?.Protected()
            .Verify(
                "SendAsync",
                Times.Exactly(1),
                ItExpr.Is<HttpRequestMessage>(req => match(req)),
                ItExpr.IsAny<CancellationToken>()
            );

        }

        // [Test]
        // public async Task TestGetLocation()
        // {
        //     var testIp = "100.0.0.0";

        //     var httpContext = new DefaultHttpContext()
        //     {
        //         Connection =
        //         {
        //             RemoteIpAddress = new IPAddress(100000)
        //         }
        //     };
        //     if (_contextAccessor != null)
        //     {
        //         _contextAccessor.HttpContext = httpContext;
        //     }
        //     LocationApi? location = await _locationProvider?.GetLocation()!;

        //     Assert.That(location, Is.Not.Null);

        //     // not sure if okay that put !there
        //     Verify(_handlerMock!, r => r.RequestUri!.Query.Contains(testIp));

        //     // call get location again and verify that the mock method (the async call)
        //     // was still only called once (meaning was not called again, to test cache)

        //     // Verify(_ => _.Update)





        //     // context.Request.Headers.

        //     // _contextAccessor.HttpContext.


        // }

        [Test]
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


            // not sure if okay that put ! there
            Verify(_handlerMock!, r => r.RequestUri!.Query.Contains(testIp));
            Verify(_handlerMock!, r => r.RequestUri!.Query.Contains("123.1.2.3"));

            // _handlerMock.
            // Console.WriteLine("mock:" + _handlerMock);
        }


        // public void TestGetLocationUsesCache()
        // {

        // }

        // // [Test]
        // // public void TestGetLocationWithCaching()
        // // {
        // //     // create a mock context with a set IP
        // //     var httpContext = new DefaultHttpContext();


        // //     // call GetLocation() 


        // // }

        // // [Test]
        // // public void TestGetLocationFromIp()
        // // {
        // //     var ipAddressWithoutPort = "100.0.0.0";

        // //     // how to set up locationProvider
        // //     var location = _locationProvider.GetLocationFromIp(ipAddressWithoutPort);

        // //     // ideally, would create a locationAPI and check that values match
        // //     // (but that would also then be quite dependent on implementation, 
        // //     // e.g. which fields we are returning)
        // //     Assert.That(location, Is.Not.Null);

        // // }
    }
}
