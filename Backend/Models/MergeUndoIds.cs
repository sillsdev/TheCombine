using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Microsoft.AspNetCore.Http;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BackendFramework.Models
{
    /// <summary> The parent and children ids of each <see cref="Word"> involved in a merge </summary>
    public class MergeUndoIds
    {
        [Required]
        [BsonElement("parentIds")]
        public List<string> ParentIds { get; set; }

        [Required]
        [BsonElement("childIds")]
        public List<string> ChildIds { get; set; }

        public MergeUndoIds()
        {
            ParentIds = new List<string>();
            ChildIds = new List<string>();
        }

        public MergeUndoIds(List<string> ParentIds, List<string> ChildIds)
        {
            this.ParentIds = ParentIds;
            this.ChildIds = ChildIds;
        }

        public MergeUndoIds Clone()
        {
            var clone = new MergeUndoIds
            {
                ParentIds = new List<string>(),
                ChildIds = new List<string>()
            };

            foreach (var id in ParentIds)
            {
                clone.ParentIds.Add(id);
            }

            foreach (var id in ChildIds)
            {
                clone.ChildIds.Add(id);
            }

            return clone;
        }

        public bool ContentEquals(MergeUndoIds other)
        {
            return
                other.ParentIds.All(ParentIds.Contains) &&
                other.ChildIds.All(ChildIds.Contains);
        }

        public override bool Equals(object? obj)
        {
            if (obj is not MergeUndoIds other || GetType() != obj.GetType())
            {
                return false;
            }

            return ContentEquals(other);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(ParentIds, ChildIds);
        }
    }
}