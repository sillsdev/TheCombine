namespace BackendFramework.Interfaces
{
    public interface IAcknowledgmentTracker
    {
        /// <summary> Register a new request to track for acknowledgment. </summary>
        void TrackRequest(string requestId, string userId);

        /// <summary> Mark a request as acknowledged. </summary>
        void MarkAcknowledged(string requestId);

        /// <summary> Check if a request has been acknowledged. </summary>
        bool IsAcknowledged(string requestId);

        /// <summary> Remove a request from tracking (cleanup). </summary>
        void RemoveRequest(string requestId);
    }
}
