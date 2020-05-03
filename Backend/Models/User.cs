using System;
using System.Collections.Generic;
using System.Linq;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BackendFramework.Models
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("avatar")]
        public string Avatar { get; set; }

        [BsonElement("name")]
        public string Name { get; set; }

        [BsonElement("email")]
        public string Email { get; set; }

        [BsonElement("phone")]
        public string Phone { get; set; }

        /// <summary> Other form of contact if phone/email are unavailable </summary>
        [BsonElement("otherConnectionField")]
        public string OtherConnectionField { get; set; }

        /// <summary> Maps a projectId to a userEditId </summary>
        [BsonElement("workedProjects")]
        public Dictionary<string, string> WorkedProjects { get; set; }

        /// <summary> Maps a projectId to a userRoleId </summary>
        [BsonElement("projectRoles")]
        public Dictionary<string, string> ProjectRoles { get; set; }

        /// <summary> If the user has consented for audio/video containing them to be used </summary>
        [BsonElement("agreement")]
        public bool Agreement { get; set; }

        [BsonElement("password")]
        public string Password { get; set; }

        [BsonElement("username")]
        public string Username { get; set; }

        [BsonElement("uiLang")]
        public string UILang { get; set; }

        [BsonElement("token")]
        public string Token { get; set; }

        /// <summary>
        /// Is set to true if the user is a Database Admin, implicitly grants ALL permissions for ALL Projects
        /// </summary>
        [BsonElement("isAdmin")]
        public bool IsAdmin { get; set; }

        public User()
        {
            Id = "";
            Avatar = "";
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
                Id = Id.Clone() as string,
                Avatar = Avatar.Clone() as string,
                Name = Name.Clone() as string,
                Email = Email.Clone() as string,
                Phone = Phone.Clone() as string,
                OtherConnectionField = OtherConnectionField.Clone() as string,
                Agreement = Agreement,
                Password = Password.Clone() as string,
                Username = Username.Clone() as string,
                UILang = UILang.Clone() as string,
                Token = Token.Clone() as string,
                WorkedProjects = new Dictionary<string, string>(),
                ProjectRoles = new Dictionary<string, string>()
            };

            foreach (var projId in WorkedProjects.Keys)
            {
                clone.WorkedProjects.Add(projId.Clone() as string, WorkedProjects[projId].Clone() as string);
            }

            foreach (var projId in ProjectRoles.Keys)
            {
                clone.ProjectRoles.Add(projId.Clone() as string, ProjectRoles[projId].Clone() as string);
            }

            return clone;
        }

        public bool ContentEquals(User other)
        {
            return
                other.Id.Equals(Id) &&
                other.Avatar.Equals(Avatar) &&
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

        public override bool Equals(object obj)
        {
            if ((obj == null) || !GetType().Equals(obj.GetType()))
            {
                return false;
            }

            var other = obj as User;
            return other.Id.Equals(Id) && ContentEquals(other);
        }

        public override int GetHashCode()
        {
            var hash = new HashCode();
            hash.Add(Id);
            hash.Add(Avatar);
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
    }

    /// <summary> Contains username and password for authentication. </summary>
    public class Credentials
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }
}
