using Microsoft.AspNetCore.Http;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

using System.Threading;
using System.Threading.Tasks;
using System.IO;
using System;

using System.Linq;
using System.Text;

using System.ComponentModel;
using System.Diagnostics;

using System.Text.RegularExpressions;

using System.Xml;
using SIL.Lift.Parsing;

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
        public interface IFormFile
        {
            string ContentType { get; }
            string ContentDisposition { get; }
            IHeaderDictionary Headers { get; }
            long Length { get; }
            string Name { get; }
            string FileName { get; }
            Stream OpenReadStream();
            void CopyTo(Stream target);
            Task CopyToAsync(Stream target, CancellationToken cancellationToken = default);
        }
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