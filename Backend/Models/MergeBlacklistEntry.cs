using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BackendFramework.Models
{
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

        public MergeBlacklistEntry(string projectId, string userId, List<string> wordIds)
        {
            Id = "";
            ProjectId = projectId;
            UserId = userId;
            WordIds = wordIds;
        }

        public MergeBlacklistEntry Clone()
        {
            var ClonedWordIds = new List<string>();
            foreach (var id in WordIds)
            {
                ClonedWordIds.Add((string)id.Clone());
            }
            return new MergeBlacklistEntry(ProjectId, UserId, ClonedWordIds) { Id = (string)Id.Clone() };
        }
    }
}
