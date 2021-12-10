using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BackendFramework.Models
{
    /// <summary> The permissions a <see cref="User"/> has on a particular <see cref="Project"/> </summary>
    public class UserRole
    {
        [Required]
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        /// <summary> Integer representation of <see cref="Permission"/> </summary>
        [Required]
        [BsonElement("permissions")]
        public List<Permission> Permissions { get; set; }

        [Required]
        [BsonElement("projectId")]
        public string ProjectId { get; set; }

        public UserRole()
        {
            Id = "";
            ProjectId = "";
            Permissions = new List<Permission>();
        }

        public UserRole Clone()
        {
            var clone = new UserRole
            {
                Id = (string)Id.Clone(),
                ProjectId = (string)ProjectId.Clone(),
                Permissions = new List<Permission>()
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
            if (obj is not UserRole other || GetType() != obj.GetType())
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
        /// <summary> Project Owner by default should be given to the user who created the project </summary>
        Owner = 6,

        /// <summary> Project Admin, can edit project settings and add and remove users, change userRoles </summary>
        DeleteEditSettingsAndUsers = 5,

        /// <summary> Can import and export lift </summary>
        ImportExport = 4,

        /// <summary> Can merge words and change the char set </summary>
        MergeAndReviewEntries = 3,

        // Permission value 2 is currently unused. It is not defined so that it does not propagate through OpenAPI.

        /// <summary> Can enter words </summary>
        WordEntry = 1
    }
}
