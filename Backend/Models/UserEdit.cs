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
        public string Id { get; set; }

        [Required]
        [BsonElement("edits")]
        public List<Edit> Edits { get; set; }

        [Required]
        [BsonElement("projectId")]
        public string ProjectId { get; set; }

        public UserEdit()
        {
            Id = "";
            ProjectId = "";
            Edits = new();
        }

        public UserEdit Clone()
        {
            return new()
            {
                Id = Id,
                ProjectId = ProjectId,
                Edits = Edits.Select(e => e.Clone()).ToList()
            };
        }

        public bool ContentEquals(UserEdit other)
        {
            return
                other.ProjectId.Equals(ProjectId, StringComparison.Ordinal) &&
                other.Edits.Count == Edits.Count &&
                other.Edits.All(Edits.Contains);
        }

        public override bool Equals(object? obj)
        {
            if (obj is not UserEdit other || GetType() != obj.GetType())
            {
                return false;
            }

            return other.Id.Equals(Id, StringComparison.Ordinal) && ContentEquals(other);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Id, ProjectId, Edits);
        }
    }

    public class UserEditStepWrapper
    {
        [Required]
        [BsonGuidRepresentation(GuidRepresentation.CSharpLegacy)]
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

        public override bool Equals(object? obj)
        {
            if (obj is not UserEditStepWrapper other || GetType() != obj.GetType())
            {
                return false;
            }

            return other.EditGuid == EditGuid &&
                other.StepString.Equals(StepString, StringComparison.Ordinal) &&
                other.StepIndex == StepIndex;
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(EditGuid, StepString, StepIndex);
        }
    }

    public class Edit
    {
        [Required]
        [BsonElement("guid")]
        [BsonGuidRepresentation(GuidRepresentation.CSharpLegacy)]
#pragma warning disable CA1720
        public Guid Guid { get; set; }
#pragma warning restore CA1720

        /// <summary> Integer representation of enum GoalType in src/types/goals.ts </summary>
        [Required]
        [BsonElement("goalType")]
        public int GoalType { get; set; }

        [Required]
        [BsonElement("stepData")]
        public List<string> StepData { get; set; }

        [Required]
        [BsonElement("changes")]
        public string Changes { get; set; }

        public Edit()
        {
            Guid = Guid.NewGuid();
            GoalType = 0;
            StepData = new();
            Changes = "{}";
        }

        public Edit Clone()
        {
            return new()
            {
                Guid = Guid,
                GoalType = GoalType,
                StepData = StepData.Select(sd => sd).ToList(),
                Changes = Changes
            };
        }

        public override bool Equals(object? obj)
        {
            if (obj is not Edit other || GetType() != obj.GetType())
            {
                return false;
            }

            return other.Guid.Equals(Guid) &&
                other.GoalType.Equals(GoalType) &&
                other.StepData.Count == StepData.Count &&
                other.StepData.All(StepData.Contains) &&
                other.Changes.Equals(Changes, StringComparison.Ordinal);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Guid, GoalType, StepData, Changes);
        }
    }
}
