using System;
using System.Collections.Concurrent;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using Microsoft.Extensions.Logging;

namespace BackendFramework.Services
{
    /// <summary> Tracks SignalR message acknowledgments from clients. </summary>
    public class AcknowledgmentTracker : IAcknowledgmentTracker
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
            if (_pendingAcks.TryGetValue(requestId, out _))
            {
                _pendingAcks[requestId] = true;
            }
        }

        /// <summary>
        /// Send a message with automatic retry logic if acknowledgment is not received.
        /// </summary>
        /// <param name="requestId">Unique identifier for the request</param>
        /// <param name="userId">User ID for the message</param>
        /// <param name="sendMessageAsync">Async function to send the message</param>
        /// <param name="logger">Logger for tracking retry attempts</param>
        public async Task SendWithRetryAsync(
            string requestId, string userId, Func<Task> sendMessageAsync, ILogger logger)
        {
            TrackRequest(requestId);

            // Initial send
            await sendMessageAsync();
            logger.LogInformation("Sent success message with requestId {RequestId} to user {UserId}", requestId, userId);

            // Wait 5 seconds
            await Task.Delay(5000);
            if (!IsAcknowledged(requestId))
            {
                logger.LogWarning("No acknowledgment received for requestId {RequestId} after 5 seconds. Retrying...", requestId);
                await sendMessageAsync();

                // Wait another 10 seconds (15 total)
                await Task.Delay(10000);
                if (!IsAcknowledged(requestId))
                {
                    logger.LogWarning("No acknowledgment received for requestId {RequestId} after 15 seconds. Retrying...", requestId);
                    await sendMessageAsync();

                    // Wait another 15 seconds (30 total)
                    await Task.Delay(15000);
                    if (!IsAcknowledged(requestId))
                    {
                        logger.LogError("No acknowledgment received for requestId {RequestId} after 30 seconds. Giving up.", requestId);
                    }
                }
            }

            // Clean up
            RemoveRequest(requestId);
        }
    }
}
