using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;

namespace BackendFramework.ValueModels
{
    public class UserEdit
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("edits")]
        public List<Edit> Edits { get; set; }

        public UserEdit()
        {
            Id = "";
            Edits = new List<Edit>();
        }

        public UserEdit Clone()
        {
            UserEdit clone = new UserEdit
            {
                Id = Id.Clone() as string,
                Edits = new List<Edit>()
            };

            foreach(Edit edit in Edits)
            {
                clone.Edits.Add(edit.Clone());
            }

            return clone;
        }

        public bool ContentEquals(UserEdit other)
        {
            return
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
            return HashCode.Combine(Id, Edits);
        }
    }
    public class Edit
    {
        [BsonElement("goalType")]
        public GoalType GoalType { get; set; }

        [BsonElement("stepData")]
        public List<string> StepData { get; set; }

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