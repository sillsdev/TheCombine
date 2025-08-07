using System;
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
}
