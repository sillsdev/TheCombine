using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BackendFramework.Models
{
    public class EmailToken
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("email")]
        public string Email { get; set; }

        [BsonElement("token")]
        public string Token { get; set; }

        [BsonElement("created")]
        public DateTime Created { get; set; }

        public EmailToken()
        {
            Id = "";
            Email = "";
            Created = DateTime.Now;
            Token = Guid.NewGuid().ToString();
        }

        public EmailToken(string email) : this()
        {
            Email = email;
        }
    }
}
