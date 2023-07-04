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

        [BsonElement("projectRole")]
        public Role? Role { get; set; }

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
                Id = Id,
                ProjectId = ProjectId,
                Role = Role,
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
                other.ProjectId.Equals(ProjectId, StringComparison.Ordinal) &&
                other.Role == Role &&
                other.Permissions.Count == Permissions.Count &&
                other.Permissions.All(Permissions.Contains);
        }

        public override bool Equals(object? obj)
        {
            if (obj is not UserRole other || GetType() != obj.GetType())
            {
                return false;
            }

            return other.Id.Equals(Id, StringComparison.Ordinal) && ContentEquals(other);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Id, ProjectId, Role, Permissions);
        }
    }

    /// <remarks> This is used in a [FromBody] serializer, so its attributes cannot be set to readonly. </remarks>
    public class ProjectRole
    {

        [Required]
        [BsonElement("projectId")]
        public string ProjectId { get; set; }

        [Required]
        [BsonElement("role")]
        public Role Role { get; set; }

        public ProjectRole()
        {
            ProjectId = "";
            Role = Role.None;
        }

        public ProjectRole Clone()
        {

            return new ProjectRole
            {
                ProjectId = ProjectId,
                Role = Role,
            };
        }

        public override bool Equals(object? obj)
        {
            if (obj is not ProjectRole other || GetType() != obj.GetType())
            {
                return false;
            }

            return other.ProjectId.Equals(ProjectId, StringComparison.Ordinal) && other.Role == Role;
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(ProjectId, Role);
        }

        // TODO: Remove this function compensation once permissions are replaced with roles in the database.
        public static Role PermissionsRole(List<Permission> permissions)
        {
            return permissions.Contains(Permission.Archive) ? Role.Owner
                 : permissions.Contains(Permission.DeleteEditSettingsAndUsers) ? Role.Administrator
                 : permissions.Contains(Permission.MergeAndReviewEntries) ? Role.Editor
                 : permissions.Contains(Permission.WordEntry) ? Role.Harvester
                 : Role.None;
        }

        public static List<Permission> RolePermissions(Role role)
        {
            return role switch
            {
                // Project Owner by default should be given to the user who created the project.
                // Owner role can be transferred, but there should never be more than one per project.
                Role.Owner => new List<Permission> {
                    Permission.Archive, Permission.Import, Permission.Statistics,
                    Permission.CharacterInventory, Permission.DeleteEditSettingsAndUsers,
                    Permission.Export, Permission.MergeAndReviewEntries,
                    Permission.WordEntry
                },

                // Administrator can do Data Entry, all Data Cleanup, and most project settings.
                Role.Administrator => new List<Permission> {
                    Permission.CharacterInventory, Permission.DeleteEditSettingsAndUsers,
                    Permission.Export, Permission.MergeAndReviewEntries,
                    Permission.WordEntry
                },

                // Editor can do Data Entry and basic Data Cleanup.
                Role.Editor => new List<Permission> {
                    Permission.Export, Permission.MergeAndReviewEntries,
                    Permission.WordEntry
                },

                // Harvester can do Data Entry but no Data Cleanup.
                Role.Harvester => new List<Permission> {
                    Permission.WordEntry
                },

                _ => new List<Permission>(),
            };
        }
    }

    public enum Role
    // The gaps are intended to allow for more roles in the future.
    {
        Owner = 9,
        Administrator = 6,
        Editor = 4,
        Harvester = 2,
        None = 0,
    }

#pragma warning disable CA1711
    // Ignoring CA1711, which requires identifiers ending in Permission to implement System.Security.IPermission.
    public enum Permission
    // TODO: remove explicit integer values after permissions are no longer stored in the database.
#pragma warning restore CA1711
    {
        /// <summary> Can archive the project so it's no longer available. This is an owner-only permission. </summary>
        Archive = 9,

        /// <summary> Can update character inventory. Can also use find-and-replace, which is DANGEROUS! </summary>
        CharacterInventory = 8,

        /// <summary> Can import data into the project. This can only be done once and cannot be undone. </summary>
        Import = 7,

        /// <summary> Can see project statistics and update the workshop schedule. </summary>
        Statistics = 6,

        /// <summary> Can edit project settings and add and remove users, change userRoles. </summary>
        DeleteEditSettingsAndUsers = 5,

        /// <summary> Can export the project to lift. </summary>
        Export = 4,

        /// <summary> Can merge and review words. </summary>
        MergeAndReviewEntries = 3,

        // Permission value 2 is currently unused. It is not defined so that it does not propagate through OpenAPI.

        /// <summary> Can enter words. </summary>
        WordEntry = 1
    }
}
