using System;
using System.Collections.Generic;
using System.Linq;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BackendFramework.Models
{
    /// <summary> The permissions a <see cref="User"/> has on a particular <see cref="Project"/> </summary>
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
                Id = (string)Id.Clone(),
                ProjectId = (string)ProjectId.Clone(),
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

        public override bool Equals(object? obj)
        {
            if (!(obj is UserRole other) || GetType() != obj.GetType())
            {
                return false;
            }

            return other.Id.Equals(Id) && ContentEquals(other);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Id, ProjectId, Permissions);
        }
    }

    public enum Permission
    {
        /// <summary> Database Admin, has no limitations </summary>
        // TODO: This "permission" is redundant with User.IsAdmin() and feels out of place because it isn't a
        //    "Project-specific" permission like the others in this enum.
        DatabaseAdmin = 6,

        /// <summary> Project Admin, can edit project settings and add and remove users, change userRoles </summary>
        DeleteEditSettingsAndUsers = 5,

        /// <summary> Can import and export lift </summary>
        ImportExport = 4,

        /// <summary> Can merge words and change the char set </summary>
        MergeAndCharSet = 3,

        /// <summary> Unused </summary>
        Unused = 2,

        /// <summary> Can enter words </summary>
        WordEntry = 1
    }
}
