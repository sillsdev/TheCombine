using System;
using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography;
using Microsoft.AspNetCore.WebUtilities;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BackendFramework.Models
{
    public class EmailToken
    {
        private static readonly RandomNumberGenerator Rng = RandomNumberGenerator.Create();
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

        public EmailToken(int expireTime)
        {
            Id = "";
            Email = "";
            ExpireTime = DateTime.Now.AddMinutes(expireTime);

            var byteToken = new byte[TokenSize];
            Rng.GetBytes(byteToken);
            Token = WebEncoders.Base64UrlEncode(byteToken);
        }

        public EmailToken(int expireTime, string email) : this(expireTime)
        {
            Email = email;
        }
    }

    /// <remarks>
    /// This is used in a [FromBody] serializer, so its attributes cannot be set to readonly.
    /// </remarks>
    public class PasswordResetData
    {
        [Required]
        public string NewPassword { get; set; } = "";

        [Required]
        public string Token { get; set; } = "";
    }
}
