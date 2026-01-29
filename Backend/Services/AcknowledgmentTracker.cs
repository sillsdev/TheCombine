using System;
using System.Collections.Concurrent;
using System.Linq;
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
        /// Retry sending a message until acknowledged or retries exhausted.
        /// </summary>
        /// <param name="requestId">Unique identifier for the request</param>
        /// <param name="sendMessageAsync">Async function to send the message</param>
        /// <param name="delaySeconds">Seconds to delay before each (re)send</param>
        private async Task SendAfterDelays(string requestId, Func<Task> sendMessageAsync, int[] delaySeconds)
        {
            var total = delaySeconds.Sum();
            var subtotal = 0;

            foreach (var delay in delaySeconds)
            {
                await Task.Delay(delay * 1000);
                if (IsAcknowledged(requestId))
                {
                    break;
                }

                subtotal += delay;
                if (subtotal <= 0)
                {
                    await sendMessageAsync();
                    logger.LogInformation("Sent message with requestId {RequestId}", requestId);
                }
                else if (subtotal < total)
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
        /// Fire-and-forget send (with retries) to avoid blocking callers.
        /// </summary>
        /// <param name="userId">User ID for the message</param>
        /// <param name="sendMessageAsync">Async function to send the message</param>
        public void SendWithRetryTaskRun(string userId, Func<string, Task> sendMessageAsync)
        {
            var requestId = Guid.NewGuid().ToString();
            logger.LogInformation("Sending message with requestId {RequestId} to user {UserId}", requestId, userId);

            _ = Task.Run(async () =>
           {
               // Add request to tracking dictionary
               TrackRequest(requestId);

               try
               {
                   // Send message with retries if unacknowledged
                   await SendAfterDelays(requestId, () => sendMessageAsync(requestId), [0, 5, 10, 15]);
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
           });
        }
    }
}
