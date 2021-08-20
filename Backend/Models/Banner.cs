using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BackendFramework.Models
{
    public class Banner
    {
        /// <summary>
        /// Banner shown in the initial landing page of the app long-term to personalize the deployment.
        /// </summary>
        [Required]
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Login { get; set; }

        /// <summary>
        /// Banner used for short-term announcements related to the specific deployment.
        /// </summary>
        [Required]
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Announcement { get; set; }
    }
}
