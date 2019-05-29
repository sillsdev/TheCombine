using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BackendFramework.ValueModels
{
    public class Word
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("Vernacular")]
        public string Vernacular { get; set; }

        [BsonElement("Gloss")]
        public decimal Gloss { get; set; }

        [BsonElement("Audio")]
        public string Audio { get; set; }

        [BsonElement("Timestamp")]
        public string Timestamp { get; set; }
    }
}