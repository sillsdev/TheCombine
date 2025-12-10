using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using SIL.WritingSystems;

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

        [BsonElement("created")]
        public DateTime? Created { get; set; }

        [Required]
        [BsonElement("isActive")]
        public bool IsActive { get; set; }

        [Required]
        [BsonElement("liftImported")]
        public bool LiftImported { get; set; }

        [Required]
        [BsonElement("definitionsEnabled")]
        public bool DefinitionsEnabled { get; set; }

        [Required]
        [BsonElement("grammaticalInfoEnabled")]
        public bool GrammaticalInfoEnabled { get; set; }

        [Required]
        [BsonElement("autocompleteSetting")]
        [BsonRepresentation(BsonType.String)]
        public OffOnSetting AutocompleteSetting { get; set; }

        [Required]
        [BsonElement("protectedDataMergeAvoidEnabled")]
        [BsonRepresentation(BsonType.String)]
        public OffOnSetting ProtectedDataMergeAvoidEnabled { get; set; }

        [Required]
        [BsonElement("protectedDataOverrideEnabled")]
        [BsonRepresentation(BsonType.String)]
        public OffOnSetting ProtectedDataOverrideEnabled { get; set; }

        [Required]
        [BsonElement("semDomWritingSystem")]
        public WritingSystem SemDomWritingSystem { get; set; }

        [Required]
        [BsonElement("vernacularWritingSystem")]
        public WritingSystem VernacularWritingSystem { get; set; }

        [Required]
        [BsonElement("analysisWritingSystems")]
        public List<WritingSystem> AnalysisWritingSystems { get; set; }

        /// <summary> Custom, project-specific semantic domains. </summary>
        [Required]
        [BsonElement("semanticDomains")]
        public List<SemanticDomainFull> SemanticDomains { get; set; }

        [Required]
        [BsonElement("validCharacters")]
        public List<string> ValidCharacters { get; set; }

        [Required]
        [BsonElement("rejectedCharacters")]
        public List<string> RejectedCharacters { get; set; }

        /// <summary> Not implemented in frontend. </summary>
        [BsonElement("customFields")]
        public List<CustomField> CustomFields { get; set; }

        /// <summary> Not implemented in frontend. </summary>
        [BsonElement("wordFields")]
        public List<string> WordFields { get; set; }

        /// <summary> Not implemented in frontend. </summary>
        [BsonElement("partsOfSpeech")]
        public List<string> PartsOfSpeech { get; set; }

        [BsonElement("workshopSchedule")]
        public List<DateTime> WorkshopSchedule { get; set; }

        public Project()
        {
            Id = "";
            Name = "";
            IsActive = true;
            LiftImported = false;
            DefinitionsEnabled = false;
            GrammaticalInfoEnabled = false;
            AutocompleteSetting = OffOnSetting.On;
            ProtectedDataMergeAvoidEnabled = OffOnSetting.Off;
            ProtectedDataOverrideEnabled = OffOnSetting.Off;
            SemDomWritingSystem = new();
            VernacularWritingSystem = new();
            AnalysisWritingSystems = new();
            SemanticDomains = new();
            ValidCharacters = new();
            RejectedCharacters = new();
            CustomFields = new();
            WordFields = new();
            PartsOfSpeech = new();
            WorkshopSchedule = new();
        }

        /// <summary> Create a deep copy. </summary>
        public Project Clone()
        {
            return new()
            {
                Id = Id,
                Name = Name,
                Created = Created,
                IsActive = IsActive,
                LiftImported = LiftImported,
                DefinitionsEnabled = DefinitionsEnabled,
                GrammaticalInfoEnabled = GrammaticalInfoEnabled,
                AutocompleteSetting = AutocompleteSetting,
                ProtectedDataMergeAvoidEnabled = ProtectedDataMergeAvoidEnabled,
                ProtectedDataOverrideEnabled = ProtectedDataOverrideEnabled,
                SemDomWritingSystem = SemDomWritingSystem.Clone(),
                VernacularWritingSystem = VernacularWritingSystem.Clone(),
                AnalysisWritingSystems = AnalysisWritingSystems.Select(ws => ws.Clone()).ToList(),
                SemanticDomains = SemanticDomains.Select(sd => sd.Clone()).ToList(),
                ValidCharacters = ValidCharacters.Select(vc => vc).ToList(),
                RejectedCharacters = RejectedCharacters.Select(rc => rc).ToList(),
                CustomFields = CustomFields.Select(cf => cf.Clone()).ToList(),
                WordFields = WordFields.Select(wf => wf).ToList(),
                PartsOfSpeech = PartsOfSpeech.Select(ps => ps).ToList(),
                WorkshopSchedule = WorkshopSchedule.Select(dt => dt).ToList(),
            };
        }
    }

    public class CustomField
    {
        [Required]
        public string Name { get; set; }
        [Required]
        public string Type { get; set; }

        public CustomField()
        {
            Name = "";
            Type = "";
        }

        /// <summary> Create a deep copy. </summary>
        public CustomField Clone()
        {
            // Shallow copy is sufficient.
            return (CustomField)MemberwiseClone();
        }
    }

    public class WritingSystem
    {
        [Required]
        public string Bcp47 { get; set; }
        [Required]
        public string Name { get; set; }
        [Required]
        public string Font { get; set; }
        public bool? Rtl { get; set; }

        public WritingSystem()
        {
            Bcp47 = "";
            Name = "";
            Font = "";
        }

        public WritingSystem(string bcp47 = "", string name = "", string font = "", bool? rtl = null)
        {
            Bcp47 = bcp47;
            Name = name;
            Font = font;
            Rtl = rtl;
        }

        public WritingSystem(WritingSystemDefinition wsd)
        {
            Bcp47 = wsd.LanguageTag;
            Name = wsd.Language?.Name ?? "";
            Font = wsd.DefaultFont?.Name ?? "";
            if (wsd.RightToLeftScript)
            {
                Rtl = true;
            }
        }

        /// <summary> Create a deep copy. </summary>
        public WritingSystem Clone()
        {
            return new(Bcp47, Name, Font, Rtl);
        }

        public override string ToString()
        {
            var outString = $"name: {Name}, bcp47: {Bcp47}, font: {Font}";
            if (Rtl ?? false)
            {
                outString += $", rtl: True";
            }
            return $"<{outString}>";
        }
    }

    public class UserCreatedProject
    {
        [Required]
        public Project Project { get; set; }
        [Required]
        public User User { get; set; }

        public UserCreatedProject()
        {
            Project = new();
            User = new();
        }
    }

    public enum OffOnSetting
    {
        Off,
        On
    }
}
