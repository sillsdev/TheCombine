using System;
using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BackendFramework.Models
{
    public class EmailToken(string email)
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = "";

        [BsonElement("email")]
        public string Email { get; set; } = email;

        [BsonElement("token")]
        public string Token { get; set; } = Guid.NewGuid().ToString();

        [BsonElement("created")]
        public DateTime Created { get; set; } = DateTime.Now;
    }

    public class ProjectInvite(string projectId, string email, Role role) : EmailToken(email)
    {
        [BsonElement("projectId")]
        public string ProjectId { get; set; } = projectId;

        [BsonElement("role")]
        public Role Role { get; set; } = role;
    }

    /// <remarks>
    /// This is used in an OpenAPI return value serializer, so its attributes must be defined as properties.
    /// </remarks>
    public class EmailInviteStatus(bool isTokenValid, bool isUserRegistered)
    {
        [Required]
        public bool IsTokenValid { get; set; } = isTokenValid;
        [Required]
        public bool IsUserValid { get; set; } = isUserRegistered;
    }
}
