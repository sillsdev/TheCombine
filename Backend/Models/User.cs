using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

namespace BackendFramework.ValueModels
{
    public class Credentials
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("avatar")]
        public string Avatar { get; set; }

        [BsonElement("name")]
        public string Name { get; set; }

        [BsonElement("email")]
        public string Email { get; set; }

        [BsonElement("phone")]
        public string Phone { get; set; }

        [BsonElement("otherConnectionField")]
        public string OtherConnectionField { get; set; }

        [BsonElement("workedProjects")]
        public List<string> WorkedProjects { get; set; }

        [BsonElement("agreement")]
        public bool Agreement { get; set; }

        [BsonElement("password")]
        public string Password { get; set; }

        [BsonElement("username")]
        public string Username { get; set; }

        [BsonElement("uiLang")]
        public string UILang { get; set; }

        [BsonElement("token")]
        public string Token { get; set; }
    }
}