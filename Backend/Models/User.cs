using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;
using System.Linq;

namespace BackendFramework.ValueModels
{
    public class Credentials
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }
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

        [BsonElement("otherConnectionField")]
        public string OtherConnectionField { get; set; }

        [BsonElement("workedProjects")]
        public List<string> WorkedProjects { get; set; }

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
            WorkedProjects = new List<string>();
        }

        public User Clone()
        {
            User clone = new User
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
                WorkedProjects = new List<string>()
            };

            foreach (string proj in WorkedProjects)
            {
                clone.WorkedProjects.Add(proj.Clone() as string);
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
                other.WorkedProjects.All(WorkedProjects.Contains);
        }

        public override bool Equals(object obj)
        {
            if ((obj == null) || !GetType().Equals(obj.GetType()))
            {
                return false;
            }
            else
            {
                User other = obj as User;
                return other.Id.Equals(Id) && ContentEquals(other);
            }
        }
    }
}