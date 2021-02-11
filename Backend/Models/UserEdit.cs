﻿using System;
using System.Collections.Generic;
using System.Linq;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BackendFramework.Models
{
    /// <summary> The changes a user has made on a particular project </summary>
    public class UserEdit
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("edits")]
        public List<Edit> Edits { get; set; }

        [BsonElement("projectId")]
        public string ProjectId { get; set; }

        public UserEdit()
        {
            Id = "";
            ProjectId = "";
            Edits = new List<Edit>();
        }

        public UserEdit Clone()
        {
            var clone = new UserEdit
            {
                Id = (string)Id.Clone(),
                ProjectId = (string)ProjectId.Clone(),
                Edits = new List<Edit>()
            };

            foreach (var edit in Edits)
            {
                clone.Edits.Add(edit.Clone());
            }

            return clone;
        }

        public bool ContentEquals(UserEdit other)
        {
            return
                other.ProjectId.Equals(ProjectId) &&
                other.Edits.Count == Edits.Count &&
                other.Edits.All(Edits.Contains);
        }

        public override bool Equals(object? obj)
        {
            if (!(obj is UserEdit other) || GetType() != obj.GetType())
            {
                return false;
            }

            return other.Id.Equals(Id) && ContentEquals(other);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Id, ProjectId, Edits);
        }
    }

    public class UserEditStepWrapper
    {
        [BsonElement("goalIndex")]
        public int GoalIndex { get; set; }

        [BsonElement("stepString")]
        public string StepString { get; set; }

        [BsonElement("stepIndex")]
        /* A null StepIndex implies index equal to the length of the step list--
         * i.e. the step is to be added to the end of the list. */
        public int? StepIndex { get; set; }

        public UserEditStepWrapper(int goalIndex, string stepString, int? stepIndex = null)
        {
            GoalIndex = goalIndex;
            StepString = stepString;
            StepIndex = stepIndex;
        }

        public override bool Equals(object? obj)
        {
            if (!(obj is UserEditStepWrapper other) || GetType() != obj.GetType())
            {
                return false;
            }

            return other.GoalIndex.Equals(GoalIndex)
                && other.StepString.Equals(StepString) && other.StepIndex.Equals(StepIndex);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(GoalIndex, StepString, StepIndex);
        }
    }

    public class Edit
    {
        /// <summary> Integer representation of enum <see cref="Models.GoalType"/> </summary>
        [BsonElement("goalType")]
        public int GoalType { get; set; }

        [BsonElement("stepData")]
        public List<string> StepData { get; set; }

        public Edit()
        {
            GoalType = 0;
            StepData = new List<string>();
        }

        public Edit Clone()
        {
            var clone = new Edit
            {
                GoalType = GoalType,
                StepData = new List<string>()
            };

            foreach (var stepData in StepData)
            {
                clone.StepData.Add((string)stepData.Clone());
            }

            return clone;
        }

        public override bool Equals(object? obj)
        {
            if (!(obj is Edit other) || GetType() != obj.GetType())
            {
                return false;
            }

            return
                GoalType.Equals(other.GoalType) &&
                other.StepData.Count == StepData.Count &&
                other.StepData.All(StepData.Contains);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(GoalType, StepData);
        }
    }

    public enum GoalType
    {
        CreateCharInv,
        ValidateChars,
        CreateStrWordInv,
        ValidateStrWords,
        MergeDups,
        SpellcheckGloss,
        ViewFind,
        HandleFlags
    }
}
