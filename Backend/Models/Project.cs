using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

namespace BackendFramework.ValueModels
{
    public class SemanticDomain
    {
        public string Name { get; set; }
        public string Number { get; set; }
    }

    public class CustomField
    {
        public string Name { get; set; }
        public string Type { get; set; }
    }

    public class Project
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("Name")]
        public string Name { get; set; }

        [BsonElement("SemanticDomains")]
        public List<SemanticDomain> SemanticDomains { get; set; }

        [BsonElement("UserRoles")]
        public string UserRoles { get; set; }

        [BsonElement("Words")]
        public List<Word> Words { get; set; }

        [BsonElement("VernacularWritingSystem")]
        public string VernacularWritingSystem  { get; set; }

        [BsonElement("AnalysisWritingSystems")]
        public List<string> AnalysisWritingSystems { get; set; }

        [BsonElement("CharacterSet")]
        public List<string> CharacterSet { get; set; }

        [BsonElement("CustomFields")]
        public List<CustomField> CustomFields { get; set; }

        [BsonElement("WordFields")]
        public List<string> WordFields { get; set; }
    
        [BsonElement("PartsOfSpeech")]
        public List<string> PartsOfSpeech { get; set; }

    }
}