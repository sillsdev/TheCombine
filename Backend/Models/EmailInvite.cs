using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
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
        public List<Permission> Role { get; set; }
        [Required]
        public DateTime ExpireTime { get; set; }

        private static readonly RandomNumberGenerator Rng = RandomNumberGenerator.Create();
        private const int TokenSize = 8;

        public EmailInvite()
        {
            Email = "";
            Token = "";
            Role = new List<Permission>();
        }

        public EmailInvite(int daysUntilExpires)
        {
            Email = "";
            Role = new List<Permission>();
            ExpireTime = DateTime.Now.AddDays(daysUntilExpires);

            var byteToken = new byte[TokenSize];
            Rng.GetBytes(byteToken);
            Token = WebEncoders.Base64UrlEncode(byteToken);
        }

        public EmailInvite(int daysUntilExpires, string email, List<Permission> role) : this(daysUntilExpires)
        {
            Email = email;
            Role = role;
        }

        public EmailInvite Clone()
        {
            return new EmailInvite
            {
                Email = Email,
                Role = Role,
                Token = Token,
                ExpireTime = ExpireTime
            };
        }

        public override bool Equals(object? obj)
        {
            if (obj is not EmailInvite emailInvite || GetType() != obj.GetType())
            {
                return false;
            }

            return Email.Equals(emailInvite.Email, StringComparison.Ordinal) &&
                   Token.Equals(emailInvite.Token, StringComparison.Ordinal) &&
                   Role.Count.Equals(emailInvite.Role.Count) &&
                   Role.All(permission => emailInvite.Role.Contains(permission)) &&
                   ExpireTime == emailInvite.ExpireTime;
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Email, Token, Role, ExpireTime);
        }
    }
}
