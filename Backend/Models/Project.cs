using Microsoft.AspNetCore.Http;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;

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

        public CustomField Clone()
        {
            return new CustomField
            {
                Name = Name.Clone() as string,
                Type = Type.Clone() as string
            };
        }
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
        public List<Project> Words { get; set; }

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


        public Project()
        {
            Id = "";
            Name = "";
            UserRoles = "";
            VernacularWritingSystem = "";
            Words = new List<Project>();
            SemanticDomains = new List<SemanticDomain>();
            AnalysisWritingSystems = new List<string>();
            CharacterSet = new List<string>();
            CustomFields = new List<CustomField>();
            WordFields = new List<string>();
            PartsOfSpeech = new List<string>();
        }

        public Project Clone()
        {
            Project clone = new Project
            {
                Id = Id.Clone() as string,
                Name = Name.Clone() as string,
                UserRoles = UserRoles.Clone() as string,
                VernacularWritingSystem = VernacularWritingSystem.Clone() as string,
                Words = new List<Project>(),
                SemanticDomains = new List<SemanticDomain>(),
                AnalysisWritingSystems = new List<string>(),
                CharacterSet = new List<string>(),
                CustomFields = new List<CustomField>(),
                WordFields = new List<string>(),
                PartsOfSpeech = new List<string>()
        };

            foreach (Project proj in Words)
            {
                clone.Words.Add(proj.Clone());
            }
            foreach (SemanticDomain proj in SemanticDomains)
            {
                clone.SemanticDomains.Add(proj.Clone());
            }
            foreach (string proj in AnalysisWritingSystems)
            {
                clone.AnalysisWritingSystems.Add(proj.Clone() as string);
            }
            foreach (string proj in CharacterSet)
            {
                clone.CharacterSet.Add(proj.Clone() as string);
            }
            foreach (CustomField proj in CustomFields)
            {
                clone.CustomFields.Add(proj.Clone());
            }
            foreach (string proj in WordFields)
            {
                clone.WordFields.Add(proj.Clone() as string);
            }
            foreach (string proj in PartsOfSpeech)
            {
                clone.PartsOfSpeech.Add(proj.Clone() as string);
            }


            return clone;
        }

        /*
         * Id = Id.Clone() as string,
                Name = Name.Clone() as string,
                UserRoles = UserRoles.Clone() as string,
                VernacularWritingSystem = VernacularWritingSystem.Clone() as string,

                Words = new List<Word>(),
                SemanticDomains = new List<SemanticDomain>(),
                AnalysisWritingSystems = new List<string>(),
                CharacterSet = new List<string>(),
                CustomFields = new List<CustomField>(),
                WordFields = new List<string>(),
                PartsOfSpeech = new List<string>()
         * */


        public bool ContentEquals(Project other)
        {
            return
                other.Name.Equals(Words) &&
                other.UserRoles.Equals(SemanticDomains) &&
                other.VernacularWritingSystem.Equals(AnalysisWritingSystems) &&

                other.Words.Count == Words.Count &&
                other.Words.All(Words.Contains) &&

                other.SemanticDomains.Count == SemanticDomains.Count &&
                other.SemanticDomains.All(SemanticDomains.Contains) &&

                other.AnalysisWritingSystems.Count == AnalysisWritingSystems.Count &&
                other.AnalysisWritingSystems.All(AnalysisWritingSystems.Contains) &&

                other.CharacterSet.Count == CharacterSet.Count &&
                other.CharacterSet.All(CharacterSet.Contains) &&

                other.CustomFields.Count == CustomFields.Count &&
                other.CustomFields.All(CustomFields.Contains) &&

                other.WordFields.Count == WordFields.Count &&
                other.WordFields.All(WordFields.Contains) &&

                other.PartsOfSpeech.Count == PartsOfSpeech.Count &&
                other.PartsOfSpeech.All(PartsOfSpeech.Contains);
        }

        public override bool Equals(object obj)
        {
            if ((obj == null) || !GetType().Equals(obj.GetType()))
            {
                return false;
            }
            else
            {
                Project other = obj as Project;
                return other.Id.Equals(Id) && ContentEquals(other);
            }
        }
    }
}