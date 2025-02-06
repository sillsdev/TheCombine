using System;
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

        public override bool Equals(object? obj)
        {
            if (obj is not ProtectReason other || GetType() != obj.GetType())
            {
                return false;
            }

            return
                Type == other.Type && Count == other.Count &&
                ((Value is null && other.Value is null) ||
                    (Value is not null && Value.Equals(other.Value, StringComparison.Ordinal)));
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Type, Count, Value);
        }
    }
}
