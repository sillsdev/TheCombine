using System;
using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BackendFramework.Models
{
    public class Banner
    {
        [Required]
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        /// <summary>
        /// Banner shown in the initial landing page of the app long-term to personalize the deployment.
        /// </summary>
        [Required]
        [BsonElement("login")]
        public string Login { get; set; }

        /// <summary>
        /// Banner used for short-term announcements related to the specific deployment.
        /// </summary>
        [Required]
        [BsonElement("announcement")]
        public string Announcement { get; set; }

        public Banner()
        {
            Id = "";
            Login = "";
            Announcement = "";
        }
    }

    /// <summary>
    /// A Banner without the ID field, which is appropriate for use over the API as the Banner is treated as a
    /// singleton so its ID does not need to be exposed.
    /// </summary>
    public class SiteBanner
    {
        [Required]
        public string Login { get; set; }
        [Required]
        public string Announcement { get; set; }

        public SiteBanner()
        {
            Login = "";
            Announcement = "";
        }

        public override bool Equals(object? obj)
        {
            if (obj is not SiteBanner other || GetType() != obj.GetType())
            {
                return false;
            }

            return Login.Equals(other.Login) && Announcement.Equals(other.Announcement);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Login, Announcement);
        }
    }
}
