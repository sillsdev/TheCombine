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
        public string Id { get; set; } = "";

        [Required]
        [BsonElement("avatar")]
        public string Avatar { get; set; } = "";

        [Required]
        [BsonElement("hasAvatar")]
        public bool HasAvatar { get; set; } = false;

        [Required]
        [BsonElement("name")]
        public string Name { get; set; } = "";

        [Required]
        [BsonElement("email")]
        public string Email { get; set; } = "";

        [Required]
        [BsonElement("phone")]
        public string Phone { get; set; } = "";

        /// <summary>
        /// Other form of contact if phone/email are unavailable.
        /// Not implemented in frontend.
        /// </summary>
        [BsonElement("otherConnectionField")]
        public string OtherConnectionField { get; set; } = "";

        /// <summary> Maps a projectId to a userEditId </summary>
        [Required]
        [BsonElement("workedProjects")]
        public Dictionary<string, string> WorkedProjects { get; set; } = [];

        /// <summary> Maps a projectId to a userRoleId </summary>
        [Required]
        [BsonElement("projectRoles")]
        public Dictionary<string, string> ProjectRoles { get; set; } = [];

        /// <summary>
        /// If the user has consented for audio/video containing them to be used.
        /// Not implemented in frontend.
        /// </summary>
        [BsonElement("agreement")]
        public bool Agreement { get; set; } = false;

        [Required]
        [BsonElement("password")]
        public string Password { get; set; } = "";

        [Required]
        [BsonElement("username")]
        public string Username { get; set; } = "";

        /// <summary>
        /// Is false if user rejects analytics, true otherwise.
        /// User can update consent anytime.
        /// </summary>
        [BsonElement("analyticsOn")]
        public bool AnalyticsOn { get; set; } = true;

        /// <summary>
        /// Is set permanently to true once user first accepts or rejects analytics upon login.
        /// </summary>
        [BsonElement("answeredConsent")]
        public bool AnsweredConsent { get; set; } = false;

        [BsonElement("uiLang")]
        public string UILang { get; set; } = "";

        [Required]
        [BsonElement("glossSuggestion")]
        [BsonRepresentation(BsonType.String)]
        public OffOnSetting GlossSuggestion { get; set; } = OffOnSetting.On;

        [Required]
        [BsonElement("token")]
        public string Token { get; set; } = "";

        /// <summary>
        /// Is set to true if the user is a Database Admin, implicitly grants ALL permissions for ALL Projects
        /// </summary>
        [Required]
        [BsonElement("isAdmin")]
        public bool IsAdmin { get; set; } = false;

        /// <summary>
        /// Is set to true after a user has verified their email address.
        /// </summary>
        [BsonElement("isEmailVerified")]
        public bool IsEmailVerified { get; set; } = false;

        /// <summary> Create a deep copy. </summary>
        public User Clone()
        {
            var clone = (User)MemberwiseClone();
            clone.WorkedProjects = WorkedProjects.ToDictionary(kv => kv.Key, kv => kv.Value);
            clone.ProjectRoles = ProjectRoles.ToDictionary(kv => kv.Key, kv => kv.Value);
            return clone;
        }

        /// <summary> Removes avatar path, password, and token. </summary>
        public void Sanitize()
        {
            Avatar = "";
            Password = "";
            Token = "";
        }
    }

    public class UserStub(User user)
    {
        [Required]
        public string Id { get; set; } = user.Id;

        [Required]
        public string Name { get; set; } = user.Name;

        [Required]
        public string Username { get; set; } = user.Username;

        [Required]
        public bool HasAvatar { get; set; } = user.HasAvatar;

        public string? RoleId { get; set; }
    }

    /// <summary> Contains email/username and password for authentication. </summary>
    /// <remarks>
    /// This is used in a [FromBody] serializer, so its attributes cannot be set to readonly.
    /// </remarks>
    public class Credentials
    {
        [Required]
        public string EmailOrUsername { get; set; } = "";
        [Required]
        public string Password { get; set; } = "";
    }
}
