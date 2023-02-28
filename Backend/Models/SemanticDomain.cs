using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BackendFramework.Models
{
    public class SemanticDomain
    {
        [BsonId]
        [BsonElement("_id")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string MongoId { get; set; }
        [Required]
        [BsonElement("guid")]
        public string Guid { get; set; }
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
            MongoId = "";
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
                // If this clone is ever used in production, the MongoId may need to be excluded.
                MongoId = MongoId,
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

            return Name.Equals(other.Name) && Id.Equals(other.Id) && Lang.Equals(other.Lang) && Guid.Equals(other.Guid);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Name, Id, Lang, Guid, UserId, Created);
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

        public SemanticDomainFull()
        {
            Name = "";
            Id = "";
            Description = "";
            Questions = new List<string>();
            Lang = "";
        }

        public new SemanticDomainFull Clone()
        {
            var clone = (SemanticDomainFull)base.Clone();
            clone.Description = Description;
            clone.Questions = Questions;

            foreach (var question in Questions)
            {
                clone.Questions.Add(question);
            }

            return clone;
        }

        public override bool Equals(object? obj)
        {
            if (obj is not SemanticDomainFull other || GetType() != obj.GetType())
            {
                return false;
            }

            return
                base.Equals(other) &&
                Description.Equals(other.Description) &&
                Questions.Count == other.Questions.Count &&
                Questions.All(other.Questions.Contains);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Name, Id, Description, Questions);
        }
    }

    /// <remarks>
    /// This is used in an OpenAPI return value serializer, so its attributes must be defined as properties.
    /// </remarks>
    public class SemanticDomainTreeNode
    {
        [BsonId]
        [BsonElement("_id")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string MongoId { get; set; }

        [Required]
        [BsonElement("lang")]
        public string Lang { get; set; }
        [Required]
        [BsonElement("guid")]
        public string Guid { get; set; }
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
            MongoId = sd.MongoId;
            Lang = sd.Lang;
            Name = sd.Name;
            Id = sd.Id;
            Children = new List<SemanticDomain>();
        }
    }

    public class SemanticDomainCount
    {
        [Required]
        [BsonElement("semanticDomainTreeNode")]
        public SemanticDomainTreeNode SemanticDomainTreeNode { get; set; }

        [Required]
        [BsonElement("count")]
        public int Count { get; set; }

        public SemanticDomainCount(SemanticDomainTreeNode semanticDomainTreeNode, int count)
        {
            SemanticDomainTreeNode = semanticDomainTreeNode;
            Count = count;
        }
    }

    public class SemanticDomainTimestampNode
    {
        [Required]
        [BsonElement("shortDateString")]
        public string ShortDateString { get; set; }

        [Required]
        [BsonElement("hour")]
        public int Hour { get; set; }

        [Required]
        [BsonElement("count")]
        public int Count { get; set; }

        [Required]
        [BsonElement("nodeList")]
        public List<SemanticDomainTimestampNode> NodeList { get; set; }

        public SemanticDomainTimestampNode(string isoString, int count)
        {
            ShortDateString = DateTime.Parse(isoString, null, System.Globalization.DateTimeStyles.RoundtripKind).ToShortDateString();
            Hour = DateTime.Parse(isoString, null, System.Globalization.DateTimeStyles.RoundtripKind).Hour;
            Count = count;
            NodeList = new List<SemanticDomainTimestampNode>();
        }
    }

    public class BarChartTimestampNode
    {
        [Required]
        [BsonElement("shortDateString")]
        public string ShortDateString { get; set; }

        [Required]
        [BsonElement("userNameCountDictionary")]
        public Dictionary<string, int> UserNameCountDictionary { get; set; }

        public BarChartTimestampNode(string isoString)
        {
            ShortDateString = DateTime.Parse(isoString, null, System.Globalization.DateTimeStyles.RoundtripKind).ToShortDateString();
            UserNameCountDictionary = new Dictionary<string, int>();
        }
    }
}
