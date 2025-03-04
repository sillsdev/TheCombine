using System;
using System.Collections.Generic;
using System.Linq;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BackendFramework.Models
{
    /// <summary> A List of wordIds to avoid in future merges. </summary>
    public class MergeWordSet
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

        public MergeWordSet()
        {
            Id = "";
            ProjectId = "";
            UserId = "";
            WordIds = new();
        }

        public MergeWordSet Clone()
        {
            return new()
            {
                Id = Id,
                ProjectId = ProjectId,
                UserId = UserId,
                WordIds = WordIds.Select(id => id).ToList()
            };
        }

        public bool ContentEquals(MergeWordSet other)
        {
            return
                other.ProjectId.Equals(ProjectId, StringComparison.Ordinal) &&
                other.UserId.Equals(UserId, StringComparison.Ordinal) &&
                other.WordIds.Count == WordIds.Count &&
                other.WordIds.All(WordIds.Contains);
        }
    }
}
