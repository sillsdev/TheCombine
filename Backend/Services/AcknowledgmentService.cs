using System;
using System.Collections.Concurrent;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using Microsoft.Extensions.Logging;

namespace BackendFramework.Services
{
    /// <summary> Tracks SignalR message acknowledgments from clients. </summary>
    public class AcknowledgmentService(ILogger<AcknowledgmentService> logger) : IAcknowledgmentService
    {
        /// <summary>
        /// In-memory store of pending acknowledgments.
        /// Dictionary key is requestId, value is acknowledgment status.
        /// </summary>
        private readonly ConcurrentDictionary<string, bool> _pendingAcknowledgements = [];

        /// <summary> Mark a request as acknowledged. </summary>
        public void MarkAcknowledged(string requestId)
        {
            if (_pendingAcknowledgements.TryUpdate(requestId, true, false))
            {
                logger.LogInformation("Message with requestId {RequestId} acknowledged", requestId);
            }
        }

        /// <summary> Track a new request for acknowledgment. </summary>
        internal void TrackRequest(string requestId)
        {
            _pendingAcknowledgements.TryAdd(requestId, false);
        }

        /// <summary> Check if a request has been acknowledged. </summary>
        /// <returns>True if acknowledged, false if unacknowledged or not in tracking dictionary</returns>
        internal bool IsAcknowledged(string requestId)
        {
            if (_pendingAcknowledgements.TryGetValue(requestId, out var isAcknowledged))
            {
                return isAcknowledged;
            }
            return false;
        }

        /// <summary> Remove a request from tracking dictionary. </summary>
        private void RemoveRequest(string requestId)
        {
            _pendingAcknowledgements.TryRemove(requestId, out _);
        }

        /// <summary> Send a message with automatic retry for acknowledgment. </summary>
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
                // Send message, with retries if unacknowledged
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

        /// <summary> Retry sending a message until acknowledged. </summary>
        /// <param name="requestId">Unique identifier for the request</param>
        /// <param name="sendMessageAsync">Async function to send the message</param>
        /// <param name="sendCount">Max number of send attempts</param>
        /// <param name="delaySeconds">Seconds to delay before each resend</param>
        internal async Task SendUntilAcknowledged(
            string requestId, Func<Task> sendMessageAsync, int sendCount = 6, int delaySeconds = 5)
        {
            for (int sent = 0; sent <= sendCount; sent++)
            {
                // First send without delay
                if (sent == 0)
                {
                    await sendMessageAsync();
                    logger.LogInformation("Sent message with requestId {RequestId}", requestId);
                    continue;
                }

                // Delay for delaySeconds before each acknowledgment check
                await Task.Delay(delaySeconds * 1000);
                if (IsAcknowledged(requestId))
                {
                    break;
                }

                var subtotal = sent * delaySeconds;
                if (sent < sendCount)
                {
                    // Retry up to (sendCount - 1) times
                    logger.LogWarning("Message {RequestId} unacknowledged after {Seconds} seconds. Retrying...",
                        requestId, subtotal);
                    await sendMessageAsync();
                }
                else
                {
                    // Give up after sendCount total sends
                    logger.LogError("Message {RequestId} unacknowledged after {Seconds} seconds. Giving up.",
                        requestId, subtotal);
                }
            }
        }
    }
}
