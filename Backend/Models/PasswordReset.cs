using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Security.Cryptography;
using Microsoft.AspNetCore.WebUtilities;

namespace BackendFramework.Models
{
    public class PasswordReset
    {
        private static RNGCryptoServiceProvider Rng = new RNGCryptoServiceProvider();
        private static int TokenSize = 8;

        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("email")]
        public string Email { get; set; }

        [BsonElement("token")]
        public string Token { get; set; }

        [BsonElement("expire_time")]
        public DateTime ExpireTime { get; set; }

        public PasswordReset()
        {
            Id = "";
            Email = "";
            ExpireTime = DateTime.Now.AddMinutes(15);

            byte[] byteToken = new byte[TokenSize];
            Rng.GetBytes(byteToken);
            Token = WebEncoders.Base64UrlEncode(byteToken);
        }

        public PasswordReset(string email) : this()
        {
            Email = email;
        }
    }
}
