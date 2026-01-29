using System;
using System.Collections.Concurrent;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using Microsoft.Extensions.Logging;

namespace BackendFramework.Services
{
    /// <summary> Tracks SignalR message acknowledgments from clients. </summary>
    public class AcknowledgmentTracker(ILogger<AcknowledgmentTracker> logger) : IAcknowledgmentTracker
    {
        /// <summary>
        /// In-memory store of pending acknowledgments.
        /// Dictionary key is requestId, value is acknowledgment status.
        /// </summary>
        private readonly ConcurrentDictionary<string, bool> _pendingAcks = [];

        private void TrackRequest(string requestId)
        {
            _pendingAcks.TryAdd(requestId, false);
        }

        private bool IsAcknowledged(string requestId)
        {
            if (_pendingAcks.TryGetValue(requestId, out var isAcknowledged))
            {
                return isAcknowledged;
            }
            return false;
        }

        private void RemoveRequest(string requestId)
        {
            _pendingAcks.TryRemove(requestId, out _);
        }

        public void MarkAcknowledged(string requestId)
        {
            if (_pendingAcks.TryUpdate(requestId, true, false))
            {
                logger.LogInformation("Message with requestId {RequestId} acknowledged", requestId);
            }
        }

        /// <summary>
        /// Retry sending a message until acknowledged.
        /// </summary>
        /// <param name="requestId">Unique identifier for the request</param>
        /// <param name="sendMessageAsync">Async function to send the message</param>
        /// <param name="sendCount">Max number of send attempts</param>
        /// <param name="delaySeconds">Seconds to delay before each resend</param>
        private async Task SendUntilAcknowledged(
            string requestId, Func<Task> sendMessageAsync, int sendCount = 6, int delaySeconds = 5)
        {
            for (int sent = 0; sent <= sendCount; sent++)
            {
                if (sent == 0)
                {
                    await sendMessageAsync();
                    logger.LogInformation("Sent message with requestId {RequestId}", requestId);
                    continue;
                }

                await Task.Delay(delaySeconds * 1000);
                if (IsAcknowledged(requestId))
                {
                    break;
                }

                var subtotal = sent * delaySeconds;
                if (sent < sendCount)
                {
                    logger.LogWarning("Message {RequestId} unacknowledged after {Seconds} seconds. Retrying...",
                        requestId, subtotal
                    );
                    await sendMessageAsync();
                }
                else
                {
                    logger.LogError("Message {RequestId} unacknowledged after {Seconds} seconds. Giving up.",
                        requestId, subtotal);
                }
            }
        }

        /// <summary>
        /// Send a message with automatic retry for acknowledgment.
        /// </summary>
        /// <param name="userId">User ID for the message</param>
        /// <param name="sendMessageAsync">Async function to send the message</param>
        public async Task SendWithRetry(string userId, Func<string, Task> sendMessageAsync)
        {
            var requestId = Guid.NewGuid().ToString();
            logger.LogInformation("Sending message with requestId {RequestId} to user {UserId}", requestId, userId);

            // Add request to tracking dictionary
            TrackRequest(requestId);

            try
            {
                // Send message with retries if unacknowledged
                await SendUntilAcknowledged(requestId, () => sendMessageAsync(requestId));
            }
            catch (Exception e)
            {
                logger.LogError(e, "Failed to send message {RequestId} to user {UserId}", requestId, userId);
            }
            finally
            {
                // Clean up
                RemoveRequest(requestId);
            }
        }
    }
}
