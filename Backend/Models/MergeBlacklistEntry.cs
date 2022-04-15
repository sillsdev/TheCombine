using System.Collections.Generic;
using KellermanSoftware.CompareNetObjects;
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
            var compare = new CompareLogic();
            compare.Config.IgnoreProperty<MergeBlacklistEntry>(x => x.Id);
            compare.Config.IgnoreCollectionOrder = true;
            return compare.Compare(this, other).AreEqual;
        }
    }
}
