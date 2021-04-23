using System;
using System.Security.Cryptography;
using Microsoft.AspNetCore.WebUtilities;

namespace BackendFramework.Models
{
    public class EmailInvite
    {
        public string Id { get; set; }
        public string Email { get; set; }
        public string Token { get; set; }
        public DateTime ExpireTime { get; set; }

        private static readonly RNGCryptoServiceProvider Rng = new RNGCryptoServiceProvider();
        private const int TokenSize = 8;

        public EmailInvite()
        {
            Id = "";
            Email = "";
            Token = "";
        }

        public EmailInvite(int daysUntilExpires)
        {
            Id = "";
            Email = "";
            ExpireTime = DateTime.Now.AddDays(daysUntilExpires);

            var byteToken = new byte[TokenSize];
            Rng.GetBytes(byteToken);
            Token = WebEncoders.Base64UrlEncode(byteToken);
        }

        public EmailInvite(int daysUntilExpires, string email) : this(daysUntilExpires)
        {
            Email = email;
        }

        public EmailInvite Clone()
        {
            return new EmailInvite
            {
                Id = (string)Id.Clone(),
                Email = (string)Email.Clone(),
                Token = (string)Token.Clone(),
                ExpireTime = ExpireTime
            };
        }
    }
}
