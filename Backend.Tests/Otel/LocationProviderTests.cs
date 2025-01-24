using System;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using BackendFramework.Otel;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Moq.Protected;
using NUnit.Framework;

namespace Backend.Tests.Otel
{
    public class LocationProviderTests
    {
        private readonly IPAddress TestIpAddress = new([100, 0, 0, 0]);
        private IHttpContextAccessor _contextAccessor = null!;
        private IMemoryCache _memoryCache = null!;
        private Mock<HttpMessageHandler> _handlerMock = null!;
        private Mock<IHttpClientFactory> _httpClientFactory = null!;
        private LocationProvider _locationProvider = null!;

        [SetUp]
        public void Setup()
        {
            // Set up HttpContextAccessor with mocked IP
            var serverVariablesFeature = new Mock<IServerVariablesFeature>();
            serverVariablesFeature.Setup(x => x["HTTP_X_FORWARDED_FOR"]).Returns(TestIpAddress.ToString());
            var httpContext = new DefaultHttpContext();
            httpContext.Connection.RemoteIpAddress = TestIpAddress;
            httpContext.Features.Set(serverVariablesFeature.Object);
            httpContext.Request.Headers["CF-Connecting-IP"] = TestIpAddress.ToString();
            _contextAccessor = new HttpContextAccessor { HttpContext = httpContext };

            // Set up MemoryCache
            var services = new ServiceCollection();
            services.AddMemoryCache();
            var serviceProvider = services.BuildServiceProvider();
            _memoryCache = serviceProvider.GetService<IMemoryCache>()!;

            var result = new HttpResponseMessage()
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

            _locationProvider = new LocationProvider(_contextAccessor, _memoryCache, _httpClientFactory.Object);
        }

        public static void Verify(Mock<HttpMessageHandler> mock, Func<HttpRequestMessage, bool> match)
        {
            mock.Protected()
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
            // Act
            await _locationProvider.GetLocationFromIp(TestIpAddress.ToString());

            // Assert
            Verify(_handlerMock, r => r.RequestUri!.AbsoluteUri.Contains(TestIpAddress.ToString()));
            Verify(_handlerMock, r => !r.RequestUri!.AbsoluteUri.Contains("123.1.2.3"));
        }

        [Test]
        public async Task GetLocationUsesHttpContextIp()
        {
            // Act
            await _locationProvider.GetLocation();

            // Assert
            Verify(_handlerMock, r => r.RequestUri!.AbsoluteUri.Contains(TestIpAddress.ToString()));
            Verify(_handlerMock, r => !r.RequestUri!.AbsoluteUri.Contains("123.1.2.3"));
        }

        [Test]
        public async Task GetLocationUsesCache()
        {
            // Act
            // call getLocation twice and verify async method is called only once
            await _locationProvider.GetLocation();
            await _locationProvider.GetLocation();

            // Assert
            Verify(_handlerMock, r => r.RequestUri!.AbsoluteUri.Contains(TestIpAddress.ToString()));
        }
    }
}
