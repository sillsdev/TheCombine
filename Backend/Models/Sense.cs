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
        public Guid Guid { get; set; }

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

        [Required]
        [BsonElement("SemanticDomains")]
        public List<SemanticDomain> SemanticDomains { get; set; }

        public Sense()
        {
            // By default generate a new, unique Guid for each new Sense.
            Guid = Guid.NewGuid();
            Accessibility = Status.Active;
            GrammaticalInfo = new GrammaticalInfo();
            Definitions = new List<Definition>();
            Glosses = new List<Gloss>();
            SemanticDomains = new List<SemanticDomain>();
        }

        public Sense Clone()
        {
            var clone = new Sense
            {
                Guid = Guid,
                Accessibility = Accessibility,
                GrammaticalInfo = GrammaticalInfo.Clone(),
                Definitions = new List<Definition>(),
                Glosses = new List<Gloss>(),
                SemanticDomains = new List<SemanticDomain>(),
            };

            foreach (var definition in Definitions)
            {
                clone.Definitions.Add(definition.Clone());
            }
            foreach (var gloss in Glosses)
            {
                clone.Glosses.Add(gloss.Clone());
            }
            foreach (var sd in SemanticDomains)
            {
                clone.SemanticDomains.Add(sd.Clone());
            }

            return clone;
        }

        public override bool Equals(object? obj)
        {
            if (obj is not Sense other || GetType() != obj.GetType())
            {
                return false;
            }

            return
                other.Guid == Guid &&
                other.Accessibility == Accessibility &&
                other.GrammaticalInfo.Equals(GrammaticalInfo) &&
                other.Definitions.Count == Definitions.Count &&
                other.Definitions.All(Definitions.Contains) &&
                other.Glosses.Count == Glosses.Count &&
                other.Glosses.All(Glosses.Contains) &&
                other.SemanticDomains.Count == SemanticDomains.Count &&
                other.SemanticDomains.All(SemanticDomains.Contains);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Guid, Accessibility, GrammaticalInfo, Definitions, Glosses, SemanticDomains);
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
                Glosses.All(other.Glosses.Contains) &&
                Definitions.All(other.Definitions.Contains);
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

        public override bool Equals(object? obj)
        {
            if (obj is not Definition other || GetType() != obj.GetType())
            {
                return false;
            }

            return Language.Equals(other.Language, StringComparison.Ordinal) &&
                Text.Equals(other.Text, StringComparison.Ordinal);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Language, Text);
        }
    }

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

        public override bool Equals(object? obj)
        {
            if (obj is not GrammaticalInfo other || GetType() != obj.GetType())
            {
                return false;
            }

            return CatGroup == other.CatGroup &&
                GrammaticalCategory.Equals(other.GrammaticalCategory, StringComparison.Ordinal);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(CatGroup, GrammaticalCategory);
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

        public override bool Equals(object? obj)
        {
            if (obj is not Gloss other || GetType() != obj.GetType())
            {
                return false;
            }

            return Language.Equals(other.Language, StringComparison.Ordinal) &&
                Def.Equals(other.Def, StringComparison.Ordinal);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Language, Def);
        }
    }

    /// <summary> Information about the status of the word or sense used for merging. </summary>
    public enum Status
    {
        Active,
        Deleted,
        Duplicate,
        Protected,
        Separate
    }
}
