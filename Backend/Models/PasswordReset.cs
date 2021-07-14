using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Security.Cryptography;
using Microsoft.AspNetCore.WebUtilities;

namespace BackendFramework.Models
{
    public class PasswordReset
    {
        private static readonly RNGCryptoServiceProvider Rng = new();
        private const int TokenSize = 8;

        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("email")]
        public string Email { get; set; }

        [BsonElement("token")]
        public string Token { get; set; }

        [BsonElement("expire_time")]
        public DateTime ExpireTime { get; set; }

        public PasswordReset(int expireTime)
        {
            Id = "";
            Email = "";
            ExpireTime = DateTime.Now.AddMinutes(expireTime);

            var byteToken = new byte[TokenSize];
            Rng.GetBytes(byteToken);
            Token = WebEncoders.Base64UrlEncode(byteToken);
        }

        public PasswordReset(int expireTime, string email) : this(expireTime)
        {
            Email = email;
        }
    }
}
