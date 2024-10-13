using System;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using BackendFramework.Otel;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
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

        [SetUp]
        public void Setup()
        {
            // Set up HttpContextAccessor with mocked IP
            _contextAccessor = new HttpContextAccessor();
            var httpContext = new DefaultHttpContext()
            {
                Connection =
                {
                    RemoteIpAddress = new IPAddress(new byte[] { 100, 0, 0, 0 })
                }
            };
            _contextAccessor.HttpContext = httpContext;

            // Set up MemoryCache
            var services = new ServiceCollection();
            services.AddMemoryCache();
            var serviceProvider = services.BuildServiceProvider();
            _memoryCache = serviceProvider.GetService<IMemoryCache>();

            HttpResponseMessage result = new HttpResponseMessage()
            {
                StatusCode = HttpStatusCode.OK,
                Content = new StringContent("{}")
            };

            // Set up HttpClientFactory mock using httpClient with mocked HttpMessageHandler
            _handlerMock = new Mock<HttpMessageHandler>();
            _handlerMock.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>()
            )
            .ReturnsAsync(result)
            .Verifiable();

            var httpClient = new HttpClient(_handlerMock.Object);
            _httpClientFactory = new Mock<IHttpClientFactory>();
            _httpClientFactory
                .Setup(x => x.CreateClient(It.IsAny<string>()))
                .Returns(httpClient);

            _locationProvider = new LocationProvider(_contextAccessor, _memoryCache!, _httpClientFactory.Object);
        }

        public static void Verify(Mock<HttpMessageHandler> mock, Func<HttpRequestMessage, bool> match)
        {
            mock?.Protected()
            .Verify(
                "SendAsync",
                Times.Exactly(1),
                ItExpr.Is<HttpRequestMessage>(req => match(req)),
                ItExpr.IsAny<CancellationToken>()
            );
        }

        [Test]
        public async Task GetLocationHttpClientUsesIp()
        {
            var testIp = "100.0.0.0";
            LocationApi? location = await _locationProvider?.GetLocationFromIp(testIp)!;

            Assert.That(location, Is.Not.Null);
            Verify(_handlerMock!, r => r.RequestUri!.AbsoluteUri.Contains(testIp));
            Verify(_handlerMock!, r => !r.RequestUri!.AbsoluteUri.Contains("123.1.2.3"));
        }

        [Test]
        public async Task GetLocationUsesHttpContextIp()
        {
            var testIp = "100.0.0.0";

            LocationApi? location = await _locationProvider?.GetLocation()!;
            location = await _locationProvider?.GetLocation()!;

            Assert.That(location, Is.Not.Null);
            Verify(_handlerMock!, r => r.RequestUri!.AbsoluteUri.Contains(testIp));
            Verify(_handlerMock!, r => !r.RequestUri!.AbsoluteUri.Contains("123.1.2.3"));
        }

        [Test]
        public async Task GetLocationUsesCache()
        {
            var testIp = "100.0.0.0";

            // call getLocation twice and verify async method is called only once
            LocationApi? location = await _locationProvider?.GetLocation()!;
            location = await _locationProvider?.GetLocation()!;
            Verify(_handlerMock!, r => r.RequestUri!.AbsoluteUri.Contains(testIp));
        }
    }
}
