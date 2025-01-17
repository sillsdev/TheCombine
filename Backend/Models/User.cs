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

        /// <summary>
        /// Is true if user accepts analytics, false otherwise.
        /// User can update consent anytime.
        /// </summary>
        [BsonElement("analyticsOn")]
        public bool AnalyticsOn { get; set; }

        /// <summary>
        /// Is set permanently to true once user first accepts or rejects analytics upon login.
        /// </summary>
        [BsonElement("answeredConsent")]
        public bool AnsweredConsent { get; set; }

        [BsonElement("uiLang")]
        public string UILang { get; set; }

        [Required]
        [BsonElement("glossSuggestion")]
        [BsonRepresentation(BsonType.String)]
        public OffOnSetting GlossSuggestion { get; set; }

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
            AnalyticsOn = true;
            AnsweredConsent = false;
            UILang = "";
            GlossSuggestion = OffOnSetting.On;
            Token = "";
            IsAdmin = false;
            WorkedProjects = new();
            ProjectRoles = new();
        }

        public User Clone()
        {
            return new()
            {
                Id = Id,
                Avatar = Avatar,
                HasAvatar = HasAvatar,
                Name = Name,
                Email = Email,
                Phone = Phone,
                OtherConnectionField = OtherConnectionField,
                Agreement = Agreement,
                Password = Password,
                Username = Username,
                AnalyticsOn = AnalyticsOn,
                AnsweredConsent = AnsweredConsent,
                UILang = UILang,
                GlossSuggestion = GlossSuggestion,
                Token = Token,
                IsAdmin = IsAdmin,
                WorkedProjects = WorkedProjects.ToDictionary(kv => kv.Key, kv => kv.Value),
                ProjectRoles = ProjectRoles.ToDictionary(kv => kv.Key, kv => kv.Value),
            };
        }

        public bool ContentEquals(User other)
        {
            return
                other.Id.Equals(Id, StringComparison.Ordinal) &&
                other.Avatar.Equals(Avatar, StringComparison.Ordinal) &&
                other.HasAvatar == HasAvatar &&
                other.Name.Equals(Name, StringComparison.Ordinal) &&
                other.Email.Equals(Email, StringComparison.Ordinal) &&
                other.Phone.Equals(Phone, StringComparison.Ordinal) &&
                other.OtherConnectionField.Equals(OtherConnectionField, StringComparison.Ordinal) &&
                other.Agreement == Agreement &&
                other.Password.Equals(Password, StringComparison.Ordinal) &&
                other.Username.Equals(Username, StringComparison.Ordinal) &&
                other.AnalyticsOn == AnalyticsOn &&
                other.AnsweredConsent == AnsweredConsent &&
                other.UILang.Equals(UILang, StringComparison.Ordinal) &&
                other.GlossSuggestion.Equals(GlossSuggestion) &&
                other.Token.Equals(Token, StringComparison.Ordinal) &&
                other.IsAdmin == IsAdmin &&

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

            return other.Id.Equals(Id, StringComparison.Ordinal) && ContentEquals(other);
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
            hash.Add(AnalyticsOn);
            hash.Add(AnsweredConsent);
            hash.Add(UILang);
            hash.Add(GlossSuggestion);
            hash.Add(Token);
            hash.Add(IsAdmin);
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
