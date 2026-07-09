using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BackendFramework.Models
{
    /// <summary> The changes a user has made on a particular project </summary>
    public class UserEdit
    {
        [Required]
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = "";

        [Required]
        [BsonElement("edits")]
        public List<Edit> Edits { get; set; } = [];

        [Required]
        [BsonElement("projectId")]
        public string ProjectId { get; set; } = "";

        /// <summary> Create a deep copy. </summary>
        public UserEdit Clone()
        {
            var clone = (UserEdit)MemberwiseClone();
            clone.Edits = Edits.Select(e => e.Clone()).ToList();
            return clone;
        }
    }

    public class UserEditStepWrapper
    {
        [Required]
        [BsonGuidRepresentation(GuidRepresentation.Standard)]
        public Guid EditGuid { get; set; }

        [Required]
        public string StepString { get; set; }

        /* A null StepIndex implies index equal to the length of the step list--
         * i.e. the step is to be added to the end of the list. */
        public int? StepIndex { get; set; }

        public UserEditStepWrapper(Guid editGuid, string stepString, int? stepIndex = null)
        {
            EditGuid = editGuid;
            StepString = stepString;
            StepIndex = stepIndex;
        }
    }

    public class Edit
    {
        [Required]
        [BsonElement("guid")]
        [BsonGuidRepresentation(GuidRepresentation.Standard)]
#pragma warning disable CA1720
        public Guid Guid { get; set; } = Guid.NewGuid();
#pragma warning restore CA1720

        /// <summary> Integer representation of enum GoalType in src/types/goals.ts </summary>
        [Required]
        [BsonElement("goalType")]
        public int GoalType { get; set; }

        [Required]
        [BsonElement("stepData")]
        public List<string> StepData { get; set; } = [];

        [Required]
        [BsonElement("changes")]
        public string Changes { get; set; } = "{}";

        [BsonElement("modified")]
        public DateTime? Modified { get; set; }

        /// <summary> Create a deep copy. </summary>
        public Edit Clone()
        {
            var clone = (Edit)MemberwiseClone();
            clone.Modified = Modified is null ? null : new DateTime(Modified.Value.Ticks);
            clone.StepData = StepData.Select(sd => sd).ToList();
            return clone;
        }
    }

    /// <summary>
    /// The persisted form of a <see cref="UserEdit"/> in the UserEditsCollection, with each edit stored as a
    /// reference to a <see cref="StoredEdit"/> document so the document cannot grow toward MongoDB's 16 MB limit.
    /// </summary>
    public class StoredUserEdit
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = "";

        /// <summary> Ids of this user edit's <see cref="StoredEdit"/> documents, in order. </summary>
        [BsonElement("edits")]
        [BsonRepresentation(BsonType.ObjectId)]
        public List<string> EditIds { get; set; } = [];

        [BsonElement("projectId")]
        public string ProjectId { get; set; } = "";
    }

    /// <summary> The persisted form of an <see cref="Edit"/>: one document in the EditsCollection. </summary>
    public class StoredEdit
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = "";

        [BsonElement("projectId")]
        public string ProjectId { get; set; } = "";

        /// <summary> Id of the <see cref="StoredUserEdit"/> document this edit belongs to. </summary>
        [BsonElement("userEditId")]
        public string UserEditId { get; set; } = "";

        [BsonElement("guid")]
        [BsonGuidRepresentation(GuidRepresentation.Standard)]
#pragma warning disable CA1720
        public Guid Guid { get; set; } = Guid.NewGuid();
#pragma warning restore CA1720

        [BsonElement("goalType")]
        public int GoalType { get; set; }

        [BsonElement("stepData")]
        public List<string> StepData { get; set; } = [];

        [BsonElement("changes")]
        public string Changes { get; set; } = "{}";

        [BsonElement("modified")]
        public DateTime? Modified { get; set; }

        public StoredEdit() { }

        public StoredEdit(string projectId, string userEditId, Edit edit)
        {
            ProjectId = projectId;
            UserEditId = userEditId;
            Guid = edit.Guid;
            GoalType = edit.GoalType;
            StepData = [.. edit.StepData];
            Changes = edit.Changes;
            Modified = edit.Modified;
        }

        /// <summary> Convert to the API-facing <see cref="Edit"/> shape. </summary>
        public Edit ToEdit() => new()
        {
            Guid = Guid,
            GoalType = GoalType,
            StepData = [.. StepData],
            Changes = Changes,
            Modified = Modified,
        };
    }
}
