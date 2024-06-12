using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using SIL.Extensions;

namespace BackendFramework.Models
{
    public class SemanticDomain
    {
        [BsonElement("guid")]
#pragma warning disable CA1720
        public string Guid { get; set; }
#pragma warning restore CA1720
        [Required]
        [BsonElement("name")]
        public string Name { get; set; }
        [Required]
        [BsonElement("id")]
        public string Id { get; set; }
        [Required]
        [BsonElement("lang")]
        public string Lang { get; set; }

        [BsonElement("userId")]
        public string UserId { get; set; }

        [BsonElement("created")]
        public string Created { get; set; }

        public SemanticDomain()
        {
            Guid = System.Guid.Empty.ToString();
            Name = "";
            Id = "";
            Lang = "";
            UserId = "";
            Created = "";
        }

        public SemanticDomain Clone()
        {
            return new SemanticDomain
            {
                Guid = Guid,
                Name = Name,
                Id = Id,
                Lang = Lang,
                UserId = UserId,
                Created = Created
            };
        }

        public override bool Equals(object? obj)
        {
            if (obj is not SemanticDomain other || GetType() != obj.GetType())
            {
                return false;
            }

            return Name.Equals(other.Name, StringComparison.Ordinal) &&
                Id.Equals(other.Id, StringComparison.Ordinal) &&
                Lang.Equals(other.Lang, StringComparison.Ordinal) &&
                Guid.Equals(other.Guid, StringComparison.Ordinal);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Name, Id, Lang, Guid, UserId, Created);
        }

        /// <summary>
        /// Check if given id string is a valid id: single non-0 digits divided by periods.
        /// If allowCustom is set to true, allow the final digit to be 0.
        /// </summary>
        public static bool IsValidId(string id, bool allowCustom = false)
        {
            // Ensure the id is composed of digits and periods
            if (!id.All(c => char.IsDigit(c) || c == '.'))
            {
                return false;
            }

            // Check that each number between periods is a single non-zero digit
            var parts = id.Split(".");
            var allSingleDigit = parts.All(d => d.Length == 1);
            if (allowCustom)
            {
                // Custom domains may have 0 as the final digit
                parts = parts.Take(parts.Length - 1).ToArray();
            }
            return allSingleDigit && parts.All(d => d != "0");
        }
    }

    public class DBSemanticDomain : SemanticDomain
    {
        [BsonId]
        [BsonElement("_id")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string MongoId { get; set; }

        public DBSemanticDomain() : base()
        {
            MongoId = "";
        }
    }

    public class SemanticDomainFull : SemanticDomain
    {
        [Required]
        [BsonElement("description")]
        public string Description { get; set; }
        [Required]
        [BsonElement("questions")]
        public List<string> Questions { get; set; }

        public SemanticDomainFull() : base()
        {
            Description = "";
            Questions = new();
        }

        public SemanticDomainFull(SemanticDomain semDom)
        {
            Guid = semDom.Guid;
            Name = semDom.Name;
            Id = semDom.Id;
            Lang = semDom.Lang;
            UserId = semDom.UserId;
            Created = semDom.Created;

            Description = "";
            Questions = new();
        }

        public new SemanticDomainFull Clone()
        {
            return new(base.Clone())
            {
                Description = Description,
                Questions = Questions.Select(q => q).ToList()
            };
        }

        public override bool Equals(object? obj)
        {
            if (obj is not SemanticDomainFull other || GetType() != obj.GetType())
            {
                return false;
            }

            return
                base.Equals(other) &&
                Description.Equals(other.Description, StringComparison.Ordinal) &&
                Questions.Count == other.Questions.Count &&
                Questions.All(other.Questions.Contains);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Name, Id, Description, Questions);
        }
    }

    public class DBSemanticDomainFull : SemanticDomainFull
    {
        [BsonId]
        [BsonElement("_id")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string MongoId { get; set; }

        public DBSemanticDomainFull() : base()
        {
            MongoId = "";
        }

        public DBSemanticDomainFull(DBSemanticDomain semDom) : base(semDom)
        {
            MongoId = semDom.MongoId;
        }
    }

    /// <remarks>
    /// This is used in an OpenAPI return value serializer, so its attributes must be defined as properties.
    /// </remarks>
    public class SemanticDomainTreeNode
    {
        [Required]
        [BsonElement("lang")]
        public string Lang { get; set; }
        [Required]
        [BsonElement("guid")]
#pragma warning disable CA1720
        public string Guid { get; set; }
#pragma warning restore CA1720
        [Required]
        [BsonElement("name")]
        public string Name { get; set; }
        [Required]
        [BsonElement("id")]
        public string Id { get; set; }
        [BsonElement("prev")]
        public SemanticDomain? Previous { get; set; }
        [BsonElement("next")]
        public SemanticDomain? Next { get; set; }
        [BsonElement("parent")]
        public SemanticDomain? Parent { get; set; }
        [Required]
        [BsonElement("children")]
        public List<SemanticDomain> Children { get; set; }

        public SemanticDomainTreeNode(SemanticDomain sd)
        {
            Guid = sd.Guid;
            Lang = sd.Lang;
            Name = sd.Name;
            Id = sd.Id;
            Children = new();
        }
    }

    public class DBSemanticDomainTreeNode : SemanticDomainTreeNode
    {
        [BsonId]
        [BsonElement("_id")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string MongoId { get; set; }

        public DBSemanticDomainTreeNode(DBSemanticDomain sd) : base(sd)
        {
            MongoId = sd.MongoId;
        }
    }
}
