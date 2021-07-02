using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BackendFramework.Models
{
    public class User
    {
        [Required]
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [Required]
        [BsonElement("avatar")]
        public string Avatar { get; set; }

        [Required]
        [BsonElement("hasAvatar")]
        public bool HasAvatar { get; set; }

        [Required]
        [BsonElement("name")]
        public string Name { get; set; }

        [Required]
        [BsonElement("email")]
        public string Email { get; set; }

        [Required]
        [BsonElement("phone")]
        public string Phone { get; set; }

        /// <summary>
        /// Other form of contact if phone/email are unavailable.
        /// Not implemented in frontend.
        /// </summary>
        [BsonElement("otherConnectionField")]
        public string OtherConnectionField { get; set; }

        /// <summary> Maps a projectId to a userEditId </summary>
        [Required]
        [BsonElement("workedProjects")]
        public Dictionary<string, string> WorkedProjects { get; set; }

        /// <summary> Maps a projectId to a userRoleId </summary>
        [Required]
        [BsonElement("projectRoles")]
        public Dictionary<string, string> ProjectRoles { get; set; }

        /// <summary>
        /// If the user has consented for audio/video containing them to be used.
        /// Not implemented in frontend.
        /// </summary>
        [BsonElement("agreement")]
        public bool Agreement { get; set; }

        [Required]
        [BsonElement("password")]
        public string Password { get; set; }

        [Required]
        [BsonElement("username")]
        public string Username { get; set; }

        /// <summary> Not implemented in frontend. </summary>
        [BsonElement("uiLang")]
        public string UILang { get; set; }

        [Required]
        [BsonElement("token")]
        public string Token { get; set; }

        /// <summary>
        /// Is set to true if the user is a Database Admin, implicitly grants ALL permissions for ALL Projects
        /// </summary>
        [Required]
        [BsonElement("isAdmin")]
        public bool IsAdmin { get; set; }

        public User()
        {
            Id = "";
            Avatar = "";
            HasAvatar = false;
            Name = "";
            Email = "";
            Phone = "";
            OtherConnectionField = "";
            Agreement = false;
            Password = "";
            Username = "";
            UILang = "";
            Token = "";
            IsAdmin = false;
            WorkedProjects = new Dictionary<string, string>();
            ProjectRoles = new Dictionary<string, string>();
        }

        public User Clone()
        {
            var clone = new User
            {
                Id = (string)Id.Clone(),
                Avatar = (string)Avatar.Clone(),
                HasAvatar = HasAvatar,
                Name = (string)Name.Clone(),
                Email = (string)Email.Clone(),
                Phone = (string)Phone.Clone(),
                OtherConnectionField = (string)OtherConnectionField.Clone(),
                Agreement = Agreement,
                Password = (string)Password.Clone(),
                Username = (string)Username.Clone(),
                UILang = (string)UILang.Clone(),
                Token = (string)Token.Clone(),
                WorkedProjects = new Dictionary<string, string>(),
                ProjectRoles = new Dictionary<string, string>()
            };

            foreach (var projId in WorkedProjects.Keys)
            {
                clone.WorkedProjects.Add((string)projId.Clone(), (string)WorkedProjects[projId].Clone());
            }

            foreach (var projId in ProjectRoles.Keys)
            {
                clone.ProjectRoles.Add((string)projId.Clone(), (string)ProjectRoles[projId].Clone());
            }

            return clone;
        }

        public bool ContentEquals(User other)
        {
            return
                other.Id.Equals(Id) &&
                other.Avatar.Equals(Avatar) &&
                other.HasAvatar.Equals(HasAvatar) &&
                other.Name.Equals(Name) &&
                other.Email.Equals(Email) &&
                other.Phone.Equals(Phone) &&
                other.OtherConnectionField.Equals(OtherConnectionField) &&
                other.Agreement.Equals(Agreement) &&
                other.Password.Equals(Password) &&
                other.Username.Equals(Username) &&
                other.UILang.Equals(UILang) &&
                other.Token.Equals(Token) &&

                other.WorkedProjects.Count == WorkedProjects.Count &&
                other.WorkedProjects.All(WorkedProjects.Contains) &&

                other.ProjectRoles.Count == ProjectRoles.Count &&
                other.ProjectRoles.All(ProjectRoles.Contains);
        }

        public override bool Equals(object? obj)
        {
            if (obj is not User other || GetType() != obj.GetType())
            {
                return false;
            }

            return other.Id.Equals(Id) && ContentEquals(other);
        }

        public override int GetHashCode()
        {
            var hash = new HashCode();
            hash.Add(Id);
            hash.Add(Avatar);
            hash.Add(HasAvatar);
            hash.Add(Name);
            hash.Add(Email);
            hash.Add(Phone);
            hash.Add(OtherConnectionField);
            hash.Add(WorkedProjects);
            hash.Add(ProjectRoles);
            hash.Add(Agreement);
            hash.Add(Password);
            hash.Add(Username);
            hash.Add(UILang);
            hash.Add(Token);
            return hash.ToHashCode();
        }

        /// <summary> Removes avatar path, password, and token. </summary>
        public void Sanitize()
        {
            Avatar = "";
            Password = "";
            Token = "";
        }
    }

    /// <summary> Contains username and password for authentication. </summary>
    /// <remarks>
    /// This is used in a [FromBody] serializer, so its attributes cannot be set to readonly.
    /// </remarks>
    public class Credentials
    {
        [Required]
        public string Username { get; set; }
        [Required]
        public string Password { get; set; }

        public Credentials()
        {
            Username = "";
            Password = "";
        }
    }
}
