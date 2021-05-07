using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace BackendFramework.Models
{
    public class Project
    {
        [Required]
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [Required]
        [BsonElement("name")]
        public string Name { get; set; }

        [Required]
        [BsonElement("isActive")]
        public bool IsActive { get; set; }

        [Required]
        [BsonElement("liftImported")]
        public bool LiftImported { get; set; }

        [Required]
        [BsonElement("semanticDomains")]
        public List<SemanticDomain> SemanticDomains { get; set; }

        [Required]
        [BsonElement("vernacularWritingSystem")]
        public WritingSystem VernacularWritingSystem { get; set; }

        [Required]
        [BsonElement("analysisWritingSystems")]
        public List<WritingSystem> AnalysisWritingSystems { get; set; }

        [Required]
        [BsonElement("validCharacters")]
        public List<string> ValidCharacters { get; set; }

        [Required]
        [BsonElement("rejectedCharacters")]
        public List<string> RejectedCharacters { get; set; }

        [Required]
        [BsonElement("autocompleteSetting")]
        [BsonRepresentation(BsonType.String)]
        public AutocompleteSetting AutocompleteSetting { get; set; }

        /// <summary> Not implemented: optional fields for projects </summary>
        [Required]
        [BsonElement("customFields")]
        public List<CustomField> CustomFields { get; set; }

        /// <summary> Not implemented: optional fields for words in a project </summary>
        [Required]
        [BsonElement("wordFields")]
        public List<string> WordFields { get; set; }

        [Required]
        [BsonElement("partsOfSpeech")]
        public List<string> PartsOfSpeech { get; set; }

        [Required]
        [BsonElement("inviteToken")]
        public List<EmailInvite> InviteTokens { get; set; }

        public Project()
        {
            Id = "";
            Name = "";
            IsActive = true;
            LiftImported = false;
            AutocompleteSetting = AutocompleteSetting.On;
            VernacularWritingSystem = new WritingSystem();
            AnalysisWritingSystems = new List<WritingSystem>();
            SemanticDomains = new List<SemanticDomain>();
            ValidCharacters = new List<string>();
            RejectedCharacters = new List<string>();
            CustomFields = new List<CustomField>();
            WordFields = new List<string>();
            PartsOfSpeech = new List<string>();
            InviteTokens = new List<EmailInvite>();
        }

        public Project Clone()
        {
            var clone = new Project
            {
                Id = (string)Id.Clone(),
                Name = (string)Name.Clone(),
                IsActive = IsActive,
                LiftImported = LiftImported,
                AutocompleteSetting = AutocompleteSetting,
                VernacularWritingSystem = VernacularWritingSystem.Clone(),
                AnalysisWritingSystems = new List<WritingSystem>(),
                SemanticDomains = new List<SemanticDomain>(),
                ValidCharacters = new List<string>(),
                RejectedCharacters = new List<string>(),
                CustomFields = new List<CustomField>(),
                WordFields = new List<string>(),
                PartsOfSpeech = new List<string>(),
                InviteTokens = new List<EmailInvite>()
            };

            foreach (var aw in AnalysisWritingSystems)
            {
                clone.AnalysisWritingSystems.Add(aw.Clone());
            }
            foreach (var sd in SemanticDomains)
            {
                clone.SemanticDomains.Add(sd.Clone());
            }
            foreach (var cs in ValidCharacters)
            {
                clone.ValidCharacters.Add((string)cs.Clone());
            }
            foreach (var cs in RejectedCharacters)
            {
                clone.RejectedCharacters.Add((string)cs.Clone());
            }
            foreach (var cf in CustomFields)
            {
                clone.CustomFields.Add(cf.Clone());
            }
            foreach (var wf in WordFields)
            {
                clone.WordFields.Add((string)wf.Clone());
            }
            foreach (var pos in PartsOfSpeech)
            {
                clone.PartsOfSpeech.Add((string)pos.Clone());
            }
            foreach (var it in InviteTokens)
            {
                clone.InviteTokens.Add(it.Clone());
            }

            return clone;
        }

        public bool ContentEquals(Project other)
        {
            return
                other.Name.Equals(Name) &&
                other.IsActive.Equals(IsActive) &&
                other.LiftImported.Equals(LiftImported) &&
                other.AutocompleteSetting.Equals(AutocompleteSetting) &&
                other.VernacularWritingSystem.Equals(VernacularWritingSystem) &&

                other.AnalysisWritingSystems.Count == AnalysisWritingSystems.Count &&
                other.AnalysisWritingSystems.All(AnalysisWritingSystems.Contains) &&

                other.SemanticDomains.Count == SemanticDomains.Count &&
                other.SemanticDomains.All(SemanticDomains.Contains) &&

                other.ValidCharacters.Count == ValidCharacters.Count &&
                other.ValidCharacters.All(ValidCharacters.Contains) &&

                other.RejectedCharacters.Count == RejectedCharacters.Count &&
                other.RejectedCharacters.All(RejectedCharacters.Contains) &&

                other.CustomFields.Count == CustomFields.Count &&
                other.CustomFields.All(CustomFields.Contains) &&

                other.WordFields.Count == WordFields.Count &&
                other.WordFields.All(WordFields.Contains) &&

                other.PartsOfSpeech.Count == PartsOfSpeech.Count &&
                other.PartsOfSpeech.All(PartsOfSpeech.Contains) &&

                other.InviteTokens.Count == InviteTokens.Count &&
                other.InviteTokens.All(InviteTokens.Contains);
        }

        public override bool Equals(object? obj)
        {
            if (!(obj is Project other) || GetType() != obj.GetType())
            {
                return false;
            }

            return other.Id.Equals(Id) && ContentEquals(other);
        }

        public override int GetHashCode()
        {
            var hash = new HashCode();
            hash.Add(Id);
            hash.Add(Name);
            hash.Add(LiftImported);
            hash.Add(IsActive);
            hash.Add(AutocompleteSetting);
            hash.Add(VernacularWritingSystem);
            hash.Add(AnalysisWritingSystems);
            hash.Add(SemanticDomains);
            hash.Add(ValidCharacters);
            hash.Add(RejectedCharacters);
            hash.Add(CustomFields);
            hash.Add(WordFields);
            hash.Add(PartsOfSpeech);
            hash.Add(InviteTokens);
            return hash.ToHashCode();
        }
    }

    public class CustomField
    {
        [Required]
        private string Name { get; set; }
        [Required]
        private string Type { get; set; }

        public CustomField()
        {
            Name = "";
            Type = "";
        }

        public CustomField Clone()
        {
            return new CustomField
            {
                Name = (string)Name.Clone(),
                Type = (string)Type.Clone()
            };
        }
    }

    public class WritingSystem
    {
        [Required]
        public string Name { get; set; }
        [Required]
        public string Bcp47 { get; set; }
        [Required]
        public string Font { get; set; }

        public WritingSystem()
        {
            Name = "";
            Bcp47 = "";
            Font = "";
        }

        public WritingSystem Clone()
        {
            return new WritingSystem
            {
                Name = (string)Name.Clone(),
                Bcp47 = (string)Bcp47.Clone(),
                Font = (string)Font.Clone()
            };
        }

        public override bool Equals(object? obj)
        {
            if (!(obj is WritingSystem ws) || GetType() != obj.GetType())
            {
                return false;
            }

            return Name == ws.Name && Bcp47 == ws.Bcp47 && Font == ws.Font;
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Name, Bcp47, Font);
        }

        public override string ToString()
        {
            return $"<name: {Name}, bcp47: {Bcp47}, font: {Font}>";
        }
    }

    public class SemanticDomainWithSubdomains
    {
        [Required]
        public string Name;
        [Required]
        public string Id;
        [Required]
        public string Description;
        [Required]
        public List<SemanticDomainWithSubdomains> Subdomains;

        public SemanticDomainWithSubdomains(SemanticDomain sd)
        {
            Name = sd.Name;
            Id = sd.Id;
            Description = sd.Description;
            Subdomains = new List<SemanticDomainWithSubdomains>();
        }
    }

    public class ProjectWithUser : Project
    {
        [Required]
        public User? UpdatedUser;

        public ProjectWithUser(Project baseObj)
        {
            Id = baseObj.Id;
            Name = baseObj.Name;
            IsActive = baseObj.IsActive;
            AutocompleteSetting = baseObj.AutocompleteSetting;
            VernacularWritingSystem = baseObj.VernacularWritingSystem;
            AnalysisWritingSystems = baseObj.AnalysisWritingSystems;
            SemanticDomains = baseObj.SemanticDomains;
            ValidCharacters = baseObj.ValidCharacters;
            RejectedCharacters = baseObj.RejectedCharacters;
            CustomFields = baseObj.CustomFields;
            WordFields = baseObj.WordFields;
            PartsOfSpeech = baseObj.PartsOfSpeech;
            InviteTokens = baseObj.InviteTokens;
        }
    }

    [JsonConverter(typeof(StringEnumConverter))]
    public enum AutocompleteSetting
    {
        Off,
        On
    }
}
