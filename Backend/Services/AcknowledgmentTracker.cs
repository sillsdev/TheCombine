using System;
using System.Collections.Concurrent;
using BackendFramework.Interfaces;

namespace BackendFramework.Services
{
    /// <summary> Tracks SignalR message acknowledgments from clients. </summary>
    public class AcknowledgmentTracker : IAcknowledgmentTracker
    {
        private readonly ConcurrentDictionary<string, AckStatus> _pendingAcks = new();

        public void TrackRequest(string requestId, string userId)
        {
            var status = new AckStatus
            {
                RequestId = requestId,
                UserId = userId,
                SentAt = DateTime.UtcNow,
                IsAcknowledged = false
            };
            _pendingAcks.TryAdd(requestId, status);
        }

        public void MarkAcknowledged(string requestId)
        {
            if (_pendingAcks.TryGetValue(requestId, out var status))
            {
                status.IsAcknowledged = true;
            }
        }

        public bool IsAcknowledged(string requestId)
        {
            if (_pendingAcks.TryGetValue(requestId, out var status))
            {
                return status.IsAcknowledged;
            }
            return false;
        }

        public void RemoveRequest(string requestId)
        {
            _pendingAcks.TryRemove(requestId, out _);
        }

        private class AckStatus
        {
            public string RequestId { get; set; } = string.Empty;
            public string UserId { get; set; } = string.Empty;
            public DateTime SentAt { get; set; }
            public bool IsAcknowledged { get; set; }
        }
    }
}
