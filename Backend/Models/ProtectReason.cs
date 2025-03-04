using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BackendFramework.Models
{
    public enum ReasonType
    {
        Annotations,
        Etymologies,
        Examples,
        Field,
        GramInfoTrait,
        Illustrations,
        NoteWithType,
        Notes,
        PronunciationWithoutUrl,
        Relations,
        Reversals,
        Subsenses,
        Trait,
        TraitAnthroCode,
        TraitDialectLabels,
        TraitDomainType,
        TraitDoNotPublishIn,
        TraitDoNotUseForParsing,
        TraitEntryType,
        TraitExcludeAsHeadword,
        TraitMinorEntryCondition,
        TraitMorphType,
        TraitPublishIn,
        TraitSenseType,
        TraitStatus,
        TraitUsageType,
        Variants,
    };

    public class ProtectReason
    {
        [Required]
        [BsonElement("type")]
        [BsonRepresentation(BsonType.String)]
        public ReasonType Type { get; set; }

        [BsonElement("count")]
        public int? Count { get; set; }

        [BsonElement("value")]
        public string? Value { get; set; }

        public ProtectReason Clone()
        {
            return new ProtectReason
            {
                Type = Type,
                Count = Count,
                Value = Value,
            };
        }
    }
}
