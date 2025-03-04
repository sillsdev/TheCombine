using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using static BackendFramework.Helper.GrammaticalCategory;

namespace BackendFramework.Models
{
    public class Sense
    {
        /// <summary>
        /// This Guid is important for Lift round-tripping with other applications and must remain stable through Word
        /// edits.
        /// </summary>
        [Required]
        [BsonElement("guid")]
        [BsonGuidRepresentation(GuidRepresentation.CSharpLegacy)]
#pragma warning disable CA1720
        public Guid Guid { get; set; }
#pragma warning restore CA1720

        [Required]
        [BsonElement("accessibility")]
        [BsonRepresentation(BsonType.String)]
        public Status Accessibility { get; set; }

        [Required]
        [BsonElement("grammaticalInfo")]
        public GrammaticalInfo GrammaticalInfo { get; set; }

        [Required]
        [BsonElement("Definitions")]
        public List<Definition> Definitions { get; set; }

        [Required]
        [BsonElement("Glosses")]
        public List<Gloss> Glosses { get; set; }

        [BsonElement("protectReasons")]
        public List<ProtectReason> ProtectReasons { get; set; }

        [Required]
        [BsonElement("SemanticDomains")]
        public List<SemanticDomain> SemanticDomains { get; set; }

        public Sense()
        {
            // By default generate a new, unique Guid for each new Sense.
            Guid = Guid.NewGuid();
            Accessibility = Status.Active;
            GrammaticalInfo = new();
            Definitions = new();
            Glosses = new();
            ProtectReasons = new();
            SemanticDomains = new();
        }

        public Sense Clone()
        {
            return new()
            {
                Guid = Guid,
                Accessibility = Accessibility,
                GrammaticalInfo = GrammaticalInfo.Clone(),
                Definitions = Definitions.Select(d => d.Clone()).ToList(),
                Glosses = Glosses.Select(g => g.Clone()).ToList(),
                ProtectReasons = ProtectReasons.Select(pr => pr.Clone()).ToList(),
                SemanticDomains = SemanticDomains.Select(sd => sd.Clone()).ToList(),
            };
        }

        public bool IsEmpty()
        {
            return
                Glosses.All(gloss => string.IsNullOrWhiteSpace(gloss.Def)) &&
                Definitions.All(def => string.IsNullOrWhiteSpace(def.Text));
        }

        /// <summary>
        /// Check if all Gloss, Definition strings are contained in other Sense.
        /// If they are all empty, also require other sense is empty and includes same Semantic Domains.
        /// TODO: Consider if GrammaticalInfo should be a factor.
        /// </summary>
        public bool IsContainedIn(Sense other)
        {
            if (IsEmpty())
            {
                var semDomIds = SemanticDomains.Select(dom => dom.Id);
                var otherSemDomIds = other.SemanticDomains.Select(dom => dom.Id);
                return other.IsEmpty() && semDomIds.All(otherSemDomIds.Contains);
            }

            return
                Glosses.All(a => other.Glosses.Any(b => b.ContentEquals(a))) &&
                Definitions.All(a => other.Definitions.Any(b => b.ContentEquals(a)));
        }

        /// <summary> Adds all semantic domains from other Sense. </summary>
        public void CopyDomains(Sense other, string userId)
        {
            var newDoms = other.SemanticDomains.Where(dom => SemanticDomains.All(d => d.Id != dom.Id)).ToList();
            newDoms.ForEach(dom =>
            {
                if (string.IsNullOrEmpty(dom.UserId))
                {
                    dom.UserId = userId;
                }
            });
            SemanticDomains.AddRange(newDoms);
        }
    }

    public class Definition
    {
        /// <summary> The bcp-47 code for the language the definition is written in. </summary>
        [Required]
        public string Language { get; set; }

        /// <summary> The definition string. </summary>
        [Required]
        public string Text { get; set; }

        public Definition()
        {
            Language = "";
            Text = "";
        }

        public Definition Clone()
        {
            return new Definition
            {
                Language = Language,
                Text = Text
            };
        }

        public bool ContentEquals(Definition other)
        {
            return Language.Equals(other.Language, StringComparison.Ordinal) &&
                Text.Equals(other.Text, StringComparison.Ordinal);
        }
    }

    // Each of these should be in "public/locales/en/translation.json" under "grammaticalCategory.group.___".
    public enum GramCatGroup
    {
        Adjective,
        Adposition,
        Adverb,
        Classifier,
        Connective,
        Determiner,
        ExistentialMarker,
        Expletive,
        Interjection,
        Noun,
        Participle,
        Particle,
        Prenoun,
        Preverb,
        ProForm,
        Verb,
        Other,
        Unspecified,
    }

    public class GrammaticalInfo
    {
        /// <summary> User-specified text. </summary>
        [Required]
        public string GrammaticalCategory { get; set; }

        /// <summary> Group which contains the category. </summary>
        [Required]
        public GramCatGroup CatGroup { get; set; }

        public GrammaticalInfo()
        {
            CatGroup = GramCatGroup.Unspecified;
            GrammaticalCategory = "";
        }

        public GrammaticalInfo(string gramCat)
        {
            CatGroup = GetGramCatGroup(gramCat);
            GrammaticalCategory = gramCat;
        }

        public GrammaticalInfo Clone()
        {
            return new GrammaticalInfo
            {
                CatGroup = CatGroup,
                GrammaticalCategory = GrammaticalCategory
            };
        }

        public bool ContentEquals(GrammaticalInfo other)
        {
            return CatGroup == other.CatGroup &&
                GrammaticalCategory.Equals(other.GrammaticalCategory, StringComparison.Ordinal);
        }

    }

    public class Gloss
    {
        /// <summary> The bcp-47 code for the language the gloss is written in. </summary>
        [Required]
        public string Language { get; set; }

        /// <summary> The gloss string. </summary>
        [Required]
        public string Def { get; set; }

        public Gloss()
        {
            Language = "";
            Def = "";
        }

        public Gloss Clone()
        {
            return new Gloss
            {
                Language = Language,
                Def = Def
            };
        }

        public bool ContentEquals(Gloss other)
        {
            return Def.Equals(other.Def, StringComparison.Ordinal) &&
                Language.Equals(other.Language, StringComparison.Ordinal);
        }
    }

    /// <summary> Information about the status of the word or sense used for merging. </summary>
    public enum Status
    {
        Active,
        Deleted,
        Duplicate,
        Protected
    }
}
