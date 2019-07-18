using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;

namespace BackendFramework.ValueModels
{
    public class Project
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("name")]
        public string Name { get; set; }

        [BsonElement("semanticDomains")]
        public List<SemanticDomain> SemanticDomains { get; set; }

        [BsonElement("words")]
        public List<Word> Words { get; set; }

        [BsonElement("vernacularWritingSystem")]
        public string VernacularWritingSystem { get; set; }

        [BsonElement("analysisWritingSystems")]
        public List<string> AnalysisWritingSystems { get; set; }

        [BsonElement("validCharacters")]
        public List<string> ValidCharacters { get; set; }

        [BsonElement("rejectedCharacters")]
        public List<string> RejectedCharacters { get; set; }

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
            VernacularWritingSystem = "";
            Words = new List<Word>();
            SemanticDomains = new List<SemanticDomain>();
            AnalysisWritingSystems = new List<string>();
            ValidCharacters = new List<string>();
            RejectedCharacters = new List<string>();
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
                VernacularWritingSystem = VernacularWritingSystem.Clone() as string,
                Words = new List<Word>(),
                SemanticDomains = new List<SemanticDomain>(),
                AnalysisWritingSystems = new List<string>(),
                ValidCharacters = new List<string>(),
                RejectedCharacters = new List<string>(),
                CustomFields = new List<CustomField>(),
                WordFields = new List<string>(),
                PartsOfSpeech = new List<string>()
            };

            foreach (Word word in Words)
            {
                clone.Words.Add(word.Clone());
            }
            foreach (SemanticDomain sd in SemanticDomains)
            {
                clone.SemanticDomains.Add(sd.Clone());
            }
            foreach (string aws in AnalysisWritingSystems)
            {
                clone.AnalysisWritingSystems.Add(aws.Clone() as string);
            }
            foreach (string cs in ValidCharacters)
            {
                clone.ValidCharacters.Add(cs.Clone() as string);
            }
            foreach (string cs in RejectedCharacters)
            {
                clone.RejectedCharacters.Add(cs.Clone() as string);
            }
            foreach (CustomField cf in CustomFields)
            {
                clone.CustomFields.Add(cf.Clone());
            }
            foreach (string wf in WordFields)
            {
                clone.WordFields.Add(wf.Clone() as string);
            }
            foreach (string pos in PartsOfSpeech)
            {
                clone.PartsOfSpeech.Add(pos.Clone() as string);
            }

            return clone;
        }

        public bool ContentEquals(Project other)
        {
            return
                other.Name.Equals(Name) &&
                other.VernacularWritingSystem.Equals(VernacularWritingSystem) &&

                other.Words.Count == Words.Count &&
                other.Words.All(Words.Contains) &&

                other.SemanticDomains.Count == SemanticDomains.Count &&
                other.SemanticDomains.All(SemanticDomains.Contains) &&

                other.AnalysisWritingSystems.Count == AnalysisWritingSystems.Count &&
                other.AnalysisWritingSystems.All(AnalysisWritingSystems.Contains) &&

                other.ValidCharacters.Count == ValidCharacters.Count &&
                other.ValidCharacters.All(ValidCharacters.Contains) &&

                other.RejectedCharacters.Count == RejectedCharacters.Count &&
                other.RejectedCharacters.All(RejectedCharacters.Contains) &&

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

        public override int GetHashCode()
        {
            var hash = new HashCode();
            hash.Add(Id);
            hash.Add(Name);
            hash.Add(SemanticDomains);
            hash.Add(Words);
            hash.Add(VernacularWritingSystem);
            hash.Add(AnalysisWritingSystems);
            hash.Add(ValidCharacters);
            hash.Add(RejectedCharacters);
            hash.Add(CustomFields);
            hash.Add(WordFields);
            hash.Add(PartsOfSpeech);
            return hash.ToHashCode();
        }
    }

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

    public class SemanticDomainWithSubdomains
    {
        public string Name;
        public string Id;
        public List<SemanticDomainWithSubdomains> Subdomains;

        public SemanticDomainWithSubdomains(SemanticDomain sd)
        {
            Name = sd.Name;
            Id = sd.Id;
            Subdomains = new List<SemanticDomainWithSubdomains>();
        }
    }
}