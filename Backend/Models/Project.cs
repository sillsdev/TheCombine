using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;

namespace BackendFramework.ValueModels
{
    public class CustomField
    {
        public string Name { get; set; }
        public string Type { get; set; }
    }

    public class ProjectCreation
    {
        public IFormFile File { get; set; }
        public string projectName { get; set; }
        // public string source { get; set; }
        // public string Extension { get; set; }
    }

    public class Project
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("name")]
        public string Name { get; set; }

        [BsonElement("semanticDomains")]
        public List<SemanticDomain> SemanticDomains { get; set; }

        [BsonElement("userRoles")]
        public string UserRoles { get; set; }

        [BsonElement("words")]
        public List<Word> Words { get; set; }

        [BsonElement("vernacularWritingSystem")]
        public string VernacularWritingSystem { get; set; }

        [BsonElement("analysisWritingSystems")]
        public List<string> AnalysisWritingSystems { get; set; }

        [BsonElement("characterSet")]
        public List<string> CharacterSet { get; set; }

        [BsonElement("customFields")]
        public List<CustomField> CustomFields { get; set; }

        [BsonElement("wordFields")]
        public List<string> WordFields { get; set; }

        [BsonElement("partsOfSpeech")]
        public List<string> PartsOfSpeech { get; set; }
    }
}