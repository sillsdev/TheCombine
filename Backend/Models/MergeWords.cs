using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using KellermanSoftware.CompareNetObjects;
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
        // If the children are to be deleted instead of merged, use DeleteOnly = True.
        [Required]
        public bool DeleteOnly { get; set; }

        public MergeWords()
        {
            Parent = new Word();
            Children = new List<MergeSourceWord>();
            DeleteOnly = false;
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
            var compare = new CompareLogic
            {
                Config =
                {
                    IgnoreCollectionOrder = true
                }
            };
            return compare.Compare(this, other).AreEqual;
        }
    }
}
