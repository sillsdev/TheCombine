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

        [Required]
        [BsonElement("projectId")]
        public string ProjectId { get; set; }

        [Required]
        [BsonElement("role")]
        [BsonRepresentation(BsonType.String)]
        public Role Role { get; set; }

        public UserRole()
        {
            Id = "";
            ProjectId = "";
            Role = Role.None;
        }

        public UserRole Clone()
        {
            var clone = new UserRole
            {
                Id = Id,
                ProjectId = ProjectId,
                Role = Role,
            };

            return clone;
        }

        public bool ContentEquals(UserRole other)
        {
            return
                other.ProjectId.Equals(ProjectId, StringComparison.Ordinal) &&
                other.Role == Role;
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

        public static bool RoleContainsRole(Role roleA, Role roleB)
        {
            var permsA = RolePermissions(roleA);
            return RolePermissions(roleB).All(permsA.Contains);
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
    {
        Owner,
        Administrator,
        Editor,
        Harvester,
        None,
    }

#pragma warning disable CA1711
    // Ignoring CA1711, which requires identifiers ending in Permission to implement System.Security.IPermission.
    public enum Permission
#pragma warning restore CA1711
    {
        /// <summary> Can archive the project so it's no longer available. This is an owner-only permission. </summary>
        Archive,

        /// <summary> Can update character inventory. Can also use find-and-replace, which is DANGEROUS! </summary>
        CharacterInventory,

        /// <summary> Can import data into the project. This can only be done once and cannot be undone. </summary>
        Import,

        /// <summary> Can see project statistics and update the workshop schedule. </summary>
        Statistics,

        /// <summary> Can edit project settings and add and remove users, change userRoles. </summary>
        DeleteEditSettingsAndUsers,

        /// <summary> Can export the project to lift. </summary>
        Export,

        /// <summary> Can merge and review words. </summary>
        MergeAndReviewEntries,

        /// <summary> Can enter words. </summary>
        WordEntry
    }
}
