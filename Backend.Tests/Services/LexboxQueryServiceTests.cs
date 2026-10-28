using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using BackendFramework.Services;
using Moq;
using Moq.Protected;
using NUnit.Framework;

namespace Backend.Tests.Services
{
    internal sealed class LexboxQueryServiceTests
    {
        private Mock<HttpMessageHandler> _handlerMock = null!;
        private LexboxQueryService _lexboxQueryService = null!;

        [SetUp]
        public void Setup()
        {
            _handlerMock = new Mock<HttpMessageHandler>();
            _handlerMock.Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync", ItExpr.IsAny<HttpRequestMessage>(), ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(() => new HttpResponseMessage(HttpStatusCode.OK) { Content = new StringContent("[]") });

            var httpClientFactory = new Mock<IHttpClientFactory>();
            httpClientFactory.Setup(x => x.CreateClient(It.IsAny<string>()))
                .Returns(() => new HttpClient(_handlerMock.Object));

            _lexboxQueryService = new LexboxQueryService(httpClientFactory.Object);
        }

        [Test]
        public async Task TestGetProjectEntriesAsyncRequestsAllEntries()
        {
            await _lexboxQueryService.GetProjectEntriesAsync("token", "proj-code", "en");

            _handlerMock.Protected().Verify(
                "SendAsync",
                Times.Once(),
                ItExpr.Is<HttpRequestMessage>(req => req.RequestUri!.Query == "?Count=-1"),
                ItExpr.IsAny<CancellationToken>());
        }
    }
}
