using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

namespace BackendFramework.ValueModels
{
    public class Word
    {

        public enum state
        {
            active,
            deleted,
            sense,
            duplicate
        }

        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("Vernacular")]
        public string Vernacular { get; set; }

        [BsonElement("Gloss")]
        public string Gloss { get; set; }

        [BsonElement("Audio")]
        public string Audio { get; set; }

        [BsonElement("Created")]
        public string Created { get; set; }

        [BsonElement("Modified")]
        public string Modified { get; set; }

        [BsonElement("History")]
        public List<string> History { get; set; }

        [BsonElement("AudioFile")]
        public string AudioFile { get; set; }

        [BsonElement("PartOfSpeech")]
        public string PartOfSpeech { get; set; }

        [BsonElement("EditedBy")]
        public List<Users> EditedBy { get; set; }

        [BsonElement("Accessability")]
        public state Accessability { get; set; }

        [BsonElement("OtherField")]
        public string OtherField { get; set; }
    }
}