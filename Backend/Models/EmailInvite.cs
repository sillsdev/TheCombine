using System;
using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography;
using Microsoft.AspNetCore.WebUtilities;

namespace BackendFramework.Models
{
    public class EmailInvite
    {
        [Required]
        public string Email { get; set; }
        [Required]
        public string Token { get; set; }
        [Required]
        public DateTime ExpireTime { get; set; }

        private static readonly RNGCryptoServiceProvider Rng = new();
        private const int TokenSize = 8;

        public EmailInvite()
        {
            Email = "";
            Token = "";
        }

        public EmailInvite(int daysUntilExpires)
        {
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
            return new()
            {
                Email = (string)Email.Clone(),
                Token = (string)Token.Clone(),
                ExpireTime = ExpireTime
            };
        }

        public override bool Equals(object? obj)
        {
            if (obj is not EmailInvite emailInvite || GetType() != obj.GetType())
            {
                return false;
            }

            return Email == emailInvite.Email
                   && Token == emailInvite.Token
                   && ExpireTime == emailInvite.ExpireTime;
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Email, Token, ExpireTime);
        }
    }
}
