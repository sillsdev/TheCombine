﻿using System;
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
        public AutocompleteSetting AutocompleteSetting { get; set; }

        [Required]
        [BsonElement("semDomWritingSystem")]
        public WritingSystem SemDomWritingSystem { get; set; }

        [Required]
        [BsonElement("vernacularWritingSystem")]
        public WritingSystem VernacularWritingSystem { get; set; }

        [Required]
        [BsonElement("analysisWritingSystems")]
        public List<WritingSystem> AnalysisWritingSystems { get; set; }

        [Required]
        [BsonElement("semanticDomains")]
        public List<SemanticDomain> SemanticDomains { get; set; }

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
            AutocompleteSetting = AutocompleteSetting.On;
            SemDomWritingSystem = new WritingSystem();
            VernacularWritingSystem = new WritingSystem();
            AnalysisWritingSystems = new List<WritingSystem>();
            SemanticDomains = new List<SemanticDomain>();
            ValidCharacters = new List<string>();
            RejectedCharacters = new List<string>();
            CustomFields = new List<CustomField>();
            WordFields = new List<string>();
            PartsOfSpeech = new List<string>();
            InviteTokens = new List<EmailInvite>();
            WorkshopSchedule = new List<DateTime>();
        }

        public Project Clone()
        {
            var clone = new Project
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
                AnalysisWritingSystems = new List<WritingSystem>(),
                SemanticDomains = new List<SemanticDomain>(),
                ValidCharacters = new List<string>(),
                RejectedCharacters = new List<string>(),
                CustomFields = new List<CustomField>(),
                WordFields = new List<string>(),
                PartsOfSpeech = new List<string>(),
                InviteTokens = new List<EmailInvite>(),
                WorkshopSchedule = new List<DateTime>(),
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
                clone.ValidCharacters.Add(cs);
            }
            foreach (var cs in RejectedCharacters)
            {
                clone.RejectedCharacters.Add(cs);
            }
            foreach (var cf in CustomFields)
            {
                clone.CustomFields.Add(cf.Clone());
            }
            foreach (var wf in WordFields)
            {
                clone.WordFields.Add(wf);
            }
            foreach (var pos in PartsOfSpeech)
            {
                clone.PartsOfSpeech.Add(pos);
            }
            foreach (var it in InviteTokens)
            {
                clone.InviteTokens.Add(it.Clone());
            }
            foreach (var dt in WorkshopSchedule)
            {
                clone.WorkshopSchedule.Add(dt);
            }

            return clone;
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
            hash.Add(LiftImported);
            hash.Add(DefinitionsEnabled);
            hash.Add(GrammaticalInfoEnabled);
            hash.Add(IsActive);
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

        public WritingSystem()
        {
            Bcp47 = "";
            Name = "";
            Font = "";
        }

        public WritingSystem(string bcp47 = "", string name = "", string font = "")
        {
            Bcp47 = bcp47;
            Name = name;
            Font = font;
        }

        public WritingSystem(WritingSystemDefinition wsd)
        {
            Bcp47 = wsd.LanguageTag;
            Name = wsd.Language?.Name ?? "";
            Font = wsd.DefaultFont?.Name ?? "";
        }

        public WritingSystem Clone()
        {
            return new(Bcp47, Name, Font);
        }

        public override bool Equals(object? obj)
        {
            if (obj is not WritingSystem ws || GetType() != obj.GetType())
            {
                return false;
            }

            return Bcp47.Equals(ws.Bcp47, StringComparison.Ordinal) &&
                Name.Equals(ws.Name, StringComparison.Ordinal) &&
                Font.Equals(ws.Font, StringComparison.Ordinal);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Bcp47, Name, Font);
        }

        public override string ToString()
        {
            return $"<name: {Name}, bcp47: {Bcp47}, font: {Font}>";
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
            Project = new Project();
            User = new User();
        }
    }

    public enum AutocompleteSetting
    {
        Off,
        On
    }
}
