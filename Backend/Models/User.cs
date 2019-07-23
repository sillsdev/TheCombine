using Microsoft.AspNetCore.Identity;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Web;

namespace BackendFramework.ValueModels
{
    public class User : IUserStore<User>
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
        public Dictionary<string, string> WorkedProjects { get; set; }

        [BsonElement("projectRoles")]
        public Dictionary<string, string> ProjectRoles { get; set; }

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
            WorkedProjects = new Dictionary<string, string>();
            ProjectRoles = new Dictionary<string, string>();
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
                WorkedProjects = new Dictionary<string, string>(),
                ProjectRoles = new Dictionary<string, string>()
            };

            foreach (string projId in WorkedProjects.Keys)
            {
                clone.WorkedProjects.Add(projId.Clone() as string, WorkedProjects[projId].Clone() as string);
            }

            foreach (string projId in ProjectRoles.Keys)
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
            else
            {
                User other = obj as User;
                return other.Id.Equals(Id) && ContentEquals(other);
            }
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

        public Task<string> GetUserIdAsync(User user, CancellationToken cancellationToken)
        {
            return Task.FromResult(user.Id);
        }

        public Task<string> GetUserNameAsync(User user, CancellationToken cancellationToken)
        {
            return Task.FromResult(user.Name);
        }

        public Task SetUserNameAsync(User user, string userName, CancellationToken cancellationToken)
        {
            user.Name = userName;
            return Task.FromResult(Type.Missing);
        }

        public Task<string> GetNormalizedUserNameAsync(User user, CancellationToken cancellationToken)
        {
            return Task.FromResult(user.Name.ToLower());
        }

        public Task SetNormalizedUserNameAsync(User user, string normalizedName, CancellationToken cancellationToken)
        {
            user.Name = normalizedName;
            return Task.FromResult(Type.Missing);
        }

        /*
         * Within the UserStore class, you use the data access classes that you created to perform operations.
         * These are passed in using dependency injection. For example, in the SQL Server with Dapper implementation, 
         * the UserStore class has the CreateAsync method which uses an instance of DapperUsersTable to insert a new record:
         * https://docs.microsoft.com/en-us/aspnet/core/security/authentication/identity-custom-storage-providers?view=aspnetcore-2.2#userrole-storage
         */

        public Task<IdentityResult> CreateAsync(User user, CancellationToken cancellationToken)
        {
            //not sure what this should do
            return Task.FromResult(new IdentityResult());
        }

        public Task<IdentityResult> UpdateAsync(User user, CancellationToken cancellationToken)
        {
            //not sure what this should do
            return Task.FromResult(new IdentityResult());
        }

        public Task<IdentityResult> DeleteAsync(User user, CancellationToken cancellationToken)
        {
            //not sure what this should do
            return Task.FromResult(new IdentityResult());
        }

        public Task<User> FindByIdAsync(string userId, CancellationToken cancellationToken)
        {
            //not sure what this should do
            return Task.FromResult(new User());
        }

        public Task<User> FindByNameAsync(string normalizedUserName, CancellationToken cancellationToken)
        {
            //not sure what this should do
            return Task.FromResult(new User());
        }

        public void Dispose()
        {
            //what should this do
        }
    }

    public class Credentials
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }
}
 