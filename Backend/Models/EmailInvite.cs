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
        public Role Role { get; set; }
        [Required]
        public DateTime ExpireTime { get; set; }

        private static readonly RandomNumberGenerator Rng = RandomNumberGenerator.Create();
        private const int TokenSize = 8;

        public EmailInvite()
        {
            Email = "";
            Token = "";
            Role = Role.None;
        }

        public EmailInvite(int daysUntilExpires)
        {
            Email = "";
            Role = Role.None;
            ExpireTime = DateTime.Now.AddDays(daysUntilExpires);

            var byteToken = new byte[TokenSize];
            Rng.GetBytes(byteToken);
            Token = WebEncoders.Base64UrlEncode(byteToken);
        }

        public EmailInvite(int daysUntilExpires, string email, Role role) : this(daysUntilExpires)
        {
            Email = email;
            Role = role;
        }

        /// <summary> Create a deep copy. </summary>
        public EmailInvite Clone()
        {
            // Shallow copy is sufficient.
            return (EmailInvite)MemberwiseClone();
        }
    }
}
