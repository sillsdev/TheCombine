using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Microsoft.AspNetCore.Http;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BackendFramework.Models
{
    /// <summary>
    /// Helper object that contains a parent word and a number of children which will be merged into it
    /// along with the userId of who made the merge and at what time
    /// </summary>
    public class MergeWords
    {
        [Required]
        public Word Parent { get; set; }
        [Required]
        public List<MergeSourceWord> Children { get; set; }

        public MergeWords()
        {
            Parent = new Word();
            Children = new List<MergeSourceWord>();
        }
    }

    /// <summary> Helper object that contains a wordId and the type of merge that should be performed </summary>
    /// <remarks>
    /// This is used in a [FromBody] serializer, so its attributes must be defined as properties.
    /// </remarks>
    public class MergeSourceWord
    {
        [Required]
        public string SrcWordId { get; set; }
        [Required]
        public bool GetAudio { get; set; }

        public MergeSourceWord()
        {
            SrcWordId = "";
            GetAudio = false;
        }
    }

    /// <summary> The parent and children ids of each <see cref="Word"/> involved in a merge </summary>
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

        public MergeUndoIds(List<string> parentIds, List<string> childIds)
        {
            ParentIds = parentIds;
            ChildIds = childIds;
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
            if (other.ParentIds.Count != ParentIds.Count || other.ChildIds.Count != ChildIds.Count)
            {
                return false;
            }
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