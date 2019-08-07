using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;

namespace BackendFramework.ValueModels
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
            UserEdit clone = new UserEdit
            {
                Id = Id.Clone() as string,
                ProjectId = ProjectId.Clone() as string,
                Edits = new List<Edit>()
            };

            foreach (Edit edit in Edits)
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

        public override bool Equals(object obj)
        {
            if ((obj == null) || !GetType().Equals(obj.GetType()))
            {
                return false;
            }
            else
            {
                UserEdit other = obj as UserEdit;
                return other.Id.Equals(Id) && ContentEquals(other);
            }
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Id, ProjectId, Edits);
        }
    }

    public class UserEditObjectWrapper
    {
        [BsonElement("goalIndex")]
        public int GoalIndex { get; set; }

        [BsonElement("newEdit")]
        public string NewEdit { get; set; }

        public UserEditObjectWrapper(int goalIndex, string newEdit)
        {
            GoalIndex = goalIndex;
            NewEdit = newEdit;
        }

        public override bool Equals(object obj)
        {
            if ((obj == null) || !GetType().Equals(obj.GetType()))
            {
                return false;
            }
            else
            {
                UserEditObjectWrapper other = obj as UserEditObjectWrapper;
                return other.GoalIndex.Equals(GoalIndex) && other.NewEdit.Equals(NewEdit);
            }
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(GoalIndex, NewEdit);
        }
    }

    public class Edit
    {
        /// <summary> Integer representation of enum <see cref="ValueModels.GoalType"/> </summary>
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
            Edit clone = new Edit
            {
                GoalType = GoalType,
                StepData = new List<string>()
            };

            foreach (string stepData in StepData)
            {
                clone.StepData.Add(stepData.Clone() as string);
            }

            return clone;
        }

        public override bool Equals(object obj)
        {
            if ((obj == null) || !this.GetType().Equals(obj.GetType()))
            {
                return false;
            }
            else
            {
                Edit other = obj as Edit;
                return
                    GoalType.Equals(other.GoalType) &&

                    other.StepData.Count == StepData.Count &&
                    other.StepData.All(StepData.Contains);
            }
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