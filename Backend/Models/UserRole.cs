using System;
using System.Collections.Generic;
using System.Linq;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BackendFramework.Models
{
    /// <summary> The permissions a user has on a particular project </summary>
    public class UserRole
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        /// <summary> Integer representation of <see cref="Permission"/> </summary>
        [BsonElement("permissions")]
        public List<int> Permissions { get; set; }

        [BsonElement("projectId")]
        public string ProjectId { get; set; }

        public UserRole()
        {
            Id = "";
            ProjectId = "";
            Permissions = new List<int>();
        }

        public UserRole Clone()
        {
            var clone = new UserRole
            {
                Id = Id.Clone() as string,
                ProjectId = ProjectId.Clone() as string,
                Permissions = new List<int>()
            };

            foreach (var permission in Permissions)
            {
                clone.Permissions.Add(permission);
            }

            return clone;
        }

        public bool ContentEquals(UserRole other)
        {
            return
                other.ProjectId.Equals(ProjectId) &&
                other.Permissions.Count == Permissions.Count &&
                other.Permissions.All(Permissions.Contains);
        }

        public override bool Equals(object obj)
        {
            if ((obj == null) || !GetType().Equals(obj.GetType()))
            {
                return false;
            }
            else
            {
                var other = obj as UserRole;
                return other.Id.Equals(Id) && ContentEquals(other);
            }
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Id, ProjectId, Permissions);
        }
    }

    public class ProjectPermissions
    {
        public ProjectPermissions(string projectId, List<int> permissions)
        {
            ProjectId = projectId;
            Permissions = permissions;
        }
        public string ProjectId { get; set; }

        /// This is a list of permissions but is represented as ints for ease of catching HTTP requests.
        public List<int> Permissions { get; set; }
    }

    public enum Permission
    {
        /// <summary> Database Admin, has no limitations </summary>
        DatabaseAdmin = 6,

        /// <summary> Project Admin, can edit project settings and add and remove users, change userRoles </summary>
        EditSettingsNUsers = 5,

        /// <summary> Can import and export lift </summary>
        ImportExport = 4,

        /// <summary> Can merge words and change the char set </summary>
        MergeNCharSet = 3,

        /// <summary> Unused </summary>
        Unused = 2,

        /// <summary> Can enter words </summary>
        WordEntry = 1
    }

    /// <summary> Return type of Update functions </summary>
    public enum ResultOfUpdate
    {
        Updated,
        NoChange,
        NotFound
    }
}
