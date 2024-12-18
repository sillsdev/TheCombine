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

        [Required]
        [BsonElement("inviteToken")]
        public List<EmailInvite> InviteTokens { get; set; }

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
            SemDomWritingSystem = new();
            VernacularWritingSystem = new();
            AnalysisWritingSystems = new();
            SemanticDomains = new();
            ValidCharacters = new();
            RejectedCharacters = new();
            CustomFields = new();
            WordFields = new();
            PartsOfSpeech = new();
            InviteTokens = new();
            WorkshopSchedule = new();
        }

        public Project Clone()
        {
            return new()
            {
                Id = Id,
                Name = Name,
                IsActive = IsActive,
                LiftImported = LiftImported,
                DefinitionsEnabled = DefinitionsEnabled,
                GrammaticalInfoEnabled = GrammaticalInfoEnabled,
                AutocompleteSetting = AutocompleteSetting,
                SemDomWritingSystem = SemDomWritingSystem.Clone(),
                VernacularWritingSystem = VernacularWritingSystem.Clone(),
                AnalysisWritingSystems = AnalysisWritingSystems.Select(ws => ws.Clone()).ToList(),
                SemanticDomains = SemanticDomains.Select(sd => sd.Clone()).ToList(),
                ValidCharacters = ValidCharacters.Select(vc => vc).ToList(),
                RejectedCharacters = RejectedCharacters.Select(rc => rc).ToList(),
                CustomFields = CustomFields.Select(cf => cf.Clone()).ToList(),
                WordFields = WordFields.Select(wf => wf).ToList(),
                PartsOfSpeech = PartsOfSpeech.Select(ps => ps).ToList(),
                InviteTokens = InviteTokens.Select(it => it.Clone()).ToList(),
                WorkshopSchedule = WorkshopSchedule.Select(dt => dt).ToList(),
            };
        }

        public bool ContentEquals(Project other)
        {
            return
                other.Name.Equals(Name, StringComparison.Ordinal) &&
                other.IsActive == IsActive &&
                other.LiftImported == LiftImported &&
                other.DefinitionsEnabled == DefinitionsEnabled &&
                other.GrammaticalInfoEnabled == GrammaticalInfoEnabled &&
                other.AutocompleteSetting.Equals(AutocompleteSetting) &&
                other.SemDomWritingSystem.Equals(SemDomWritingSystem) &&
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
                other.InviteTokens.All(InviteTokens.Contains) &&

                other.WorkshopSchedule.Count == WorkshopSchedule.Count &&
                other.WorkshopSchedule.All(WorkshopSchedule.Contains);
        }

        public override bool Equals(object? obj)
        {
            if (obj is not Project other || GetType() != obj.GetType())
            {
                return false;
            }

            return other.Id.Equals(Id, StringComparison.Ordinal) && ContentEquals(other);
        }

        public override int GetHashCode()
        {
            var hash = new HashCode();
            hash.Add(Id);
            hash.Add(Name);
            hash.Add(IsActive);
            hash.Add(LiftImported);
            hash.Add(DefinitionsEnabled);
            hash.Add(GrammaticalInfoEnabled);
            hash.Add(AutocompleteSetting);
            hash.Add(SemDomWritingSystem);
            hash.Add(VernacularWritingSystem);
            hash.Add(AnalysisWritingSystems);
            hash.Add(SemanticDomains);
            hash.Add(ValidCharacters);
            hash.Add(RejectedCharacters);
            hash.Add(CustomFields);
            hash.Add(WordFields);
            hash.Add(PartsOfSpeech);
            hash.Add(InviteTokens);
            hash.Add(WorkshopSchedule);
            return hash.ToHashCode();
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

        public CustomField Clone()
        {
            return new CustomField
            {
                Name = Name,
                Type = Type
            };
        }

        public override bool Equals(object? obj)
        {
            if (obj is not CustomField customField || GetType() != obj.GetType())
            {
                return false;
            }

            return Name.Equals(customField.Name, StringComparison.Ordinal) &&
                Type.Equals(customField.Type, StringComparison.Ordinal);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Name, Type);
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

        public WritingSystem Clone()
        {
            return new(Bcp47, Name, Font, Rtl);
        }

        public override bool Equals(object? obj)
        {
            if (obj is not WritingSystem ws || GetType() != obj.GetType())
            {
                return false;
            }

            return Bcp47.Equals(ws.Bcp47, StringComparison.Ordinal) &&
                Name.Equals(ws.Name, StringComparison.Ordinal) &&
                Font.Equals(ws.Font, StringComparison.Ordinal) &&
                Rtl == ws.Rtl;
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Bcp47, Name, Font, Rtl ?? false);
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
