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

        [BsonElement("vernacular")]
        public string Vernacular { get; set; }

        [BsonElement("plural")]
        public string Plural { get; set; }

        [BsonElement("senses")]
        public List<Sense> Senses { get; set; }

        [BsonElement("audio")]
        public string Audio { get; set; }

        [BsonElement("created")]
        public string Created { get; set; }

        [BsonElement("modified")]
        public string Modified { get; set; }

        [BsonElement("history")]
        public List<string> History { get; set; }

        [BsonElement("partOfSpeech")]
        public string PartOfSpeech { get; set; }

        [BsonElement("editedBy")]
        public List<string> EditedBy { get; set; }

        [BsonElement("accessability")]
        public int Accessability { get; set; }

        [BsonElement("otherField")]
        public string OtherField { get; set; }
    }
    public class MergeWords
    {
        public string parent { get; set; }
        public List<string> children { get; set; }
        public state mergeType { get; set; }
        public User mergedBy { get; set; }
        public string time { get; set; }
    }

    public class Sense
    {
        public List<Gloss> Glosses { get; set; }
        public List<SemanticDomain> SemanticDomains { get; set; }
    }

    public class SemanticDomain
    {
        public string Name { get; set; }
        public string Number { get; set; }
    }

    public class Gloss
    {
        public string Language { get; set; }
        public string Def { get; set; }
    }
}