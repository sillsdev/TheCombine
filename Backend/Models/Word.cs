using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

namespace BackendFramework.ValueModels
{
    public enum state
    {
        active,
        deleted,
        sense,
        duplicate
    }
    public class Word
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("Vernacular")]
        public string Vernacular { get; set; }

        [BsonElement("Gloss")]
        public string Gloss { get; set; }

        [BsonElement("Audio")]
        public string Audio { get; set; }

        [BsonElement("Timestamp")]
        public string Timestamp { get; set; }

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
        public List<string> EditedBy { get; set; }

        [BsonElement("Accessability")]
        public int Accessability { get; set; }

        [BsonElement("OtherField")]
        public string OtherField { get; set; }
    }
    public class MergeWords
    {
        public Word parent { get; set; }
        public List<Word> children { get; set; } 
        public state mergeType { get; set; }
        public string time { get; set; }
    }
}