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

        [Required]
        [BsonElement("type")]
        public BannerType Type { get; set; }

        [Required]
        [BsonElement("text")]
        public string Text { get; set; }

        public Banner()
        {
            Id = "";
            Type = BannerType.None;
            Text = "";
        }
    }

    /// <summary>
    /// A Banner without the ID field, which is appropriate for use over the API as the Banner is treated as a
    /// singleton so its ID does not need to be exposed.
    /// </summary>
    public class SiteBanner
    {
        [Required]
        public BannerType Type { get; set; }
        [Required]
        public string Text { get; set; }

        public SiteBanner()
        {
            Type = BannerType.None;
            Text = "";
        }

        public override bool Equals(object? obj)
        {
            if (obj is not SiteBanner other || GetType() != obj.GetType())
            {
                return false;
            }

            return Type.Equals(other.Type) && Text.Equals(other.Text);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Type, Text);
        }
    }

    public enum BannerType
    {
        /// <summary> Used for empty/test banners. </summary>
        None,

        /// <summary> Shown in the login page of the app long-term to personalize the deployment. </summary>
        Login,

        /// <summary> Used for short-term announcements related to the specific deployment. </summary>
        Announcement,
    }
}
