using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;

namespace BackendFramework.ValueModels
{
    public class UserRole
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("permissions")]
        public List<Permission> Permissions { get; set; }

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
            UserRole clone = new UserRole
            {
                Id = Id.Clone() as string,
                ProjectId = ProjectId.Clone() as string,
                Permissions = new List<Permission>()
            };

            foreach(Permission permission in Permissions)
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
                UserRole other = obj as UserRole;
                return other.Id.Equals(Id) && ContentEquals(other);
            }
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Id, ProjectId, Permissions);
        }
    }

    public enum Permission
    {
        CreateProject,
        ImportLift,
        ExportLift,
        Goals,
        DataEntry
    }
}