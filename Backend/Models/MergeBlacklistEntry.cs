using System;
using System.Collections.Generic;
using System.Linq;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BackendFramework.Models
{
    /// <summary> A List of wordIds to avoid in future merges. </summary>
    public class MergeBlacklistEntry
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("projectId")]
        public string ProjectId { get; set; }

        [BsonElement("userId")]
        public string UserId { get; set; }

        [BsonElement("wordIds")]
        public List<string> WordIds { get; set; }

        public MergeBlacklistEntry()
        {
            Id = "";
            ProjectId = "";
            UserId = "";
            WordIds = new List<string>();
        }

        public MergeBlacklistEntry Clone()
        {
            var clone = new MergeBlacklistEntry
            {
                Id = (string)Id.Clone(),
                ProjectId = (string)ProjectId.Clone(),
                UserId = (string)UserId.Clone(),
                WordIds = new List<string>()
            };
            foreach (var id in WordIds)
            {
                clone.WordIds.Add((string)id.Clone());
            }
            return clone;
        }

        public bool ContentEquals(MergeBlacklistEntry other)
        {
            return
                other.ProjectId.Equals(ProjectId) &&
                other.UserId.Equals(UserId) &&
                other.WordIds.Count == WordIds.Count &&
                other.WordIds.All(WordIds.Contains);
        }

        public override bool Equals(object? obj)
        {
            if (!(obj is MergeBlacklistEntry other) || GetType() != obj.GetType())
            {
                return false;
            }
            return other.Id.Equals(Id) && ContentEquals(other);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Id, ProjectId, UserId, WordIds);
        }
    }
}
