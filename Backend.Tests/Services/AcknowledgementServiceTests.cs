using System.Threading.Tasks;
using BackendFramework.Services;
using Backend.Tests.Mocks;
using NUnit.Framework;

namespace Backend.Tests.Services
{
    internal sealed class AcknowledgementServiceTests
    {
        private AcknowledgmentService _service = null!;

        [SetUp]
        public void Setup()
        {
            _service = new AcknowledgmentService(new LoggerMock<AcknowledgmentService>());
        }

        [Test]
        public void TrackRequestAndMarkAcknowledgedTogglesStatus()
        {
            var requestId = "request-1";
            _service.TrackRequest(requestId);

            Assert.That(_service.IsAcknowledged(requestId), Is.False);

            _service.MarkAcknowledged(requestId);

            Assert.That(_service.IsAcknowledged(requestId), Is.True);
        }

        [Test]
        public async Task SendUntilAcknowledgedStopsAfterAcknowledged()
        {
            var requestId = "request-2";
            _service.TrackRequest(requestId);

            var sendCalls = 0;
            Task SendMessageAsync()
            {
                sendCalls++;
                _service.MarkAcknowledged(requestId);
                return Task.CompletedTask;
            }

            await _service.SendUntilAcknowledged(requestId, SendMessageAsync, sendCount: 3, delaySeconds: 0);

            Assert.That(sendCalls, Is.EqualTo(1));
        }

        [Test]
        public async Task SendUntilAcknowledgedSendsSendCountWhenUnacknowledged()
        {
            var requestId = "request-3";
            _service.TrackRequest(requestId);

            var sendCalls = 0;
            Task SendMessageAsync()
            {
                sendCalls++;
                return Task.CompletedTask;
            }

            const int sendCount = 3;
            await _service.SendUntilAcknowledged(requestId, SendMessageAsync, sendCount, delaySeconds: 0);

            Assert.That(sendCalls, Is.EqualTo(sendCount));
        }
    }
}
