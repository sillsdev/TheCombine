using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;
using System.Linq;

namespace BackendFramework.ValueModels
{
    public class UserRole
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("permission")]
        public List<Permission> Permission { get; set; }

        [BsonElement("history")]
        public List<History> History { get; set; }

        public UserRole()
        {
            Id = "";
            Permission = new List<Permission>();
            History = new List<History>();
        }

        public UserRole Clone()
        {
            UserRole clone = new UserRole
            {
                Id = Id.Clone() as string,
                Permission = new List<Permission>(),
                History = new List<History>()
            };

            //Enums like Permission have no need to be cloned
            foreach(Permission permission in Permission)
            {
                clone.Permission.Add(permission);
            }

            foreach(History history in History)
            {
                clone.History.Add(history.Clone() as History);
            }

            return clone;
        }

        public bool ContentEquals(UserRole other)
        {
            return
                other.Permission.Count == Permission.Count &&
                other.Permission.All(Permission.Contains) &&
                other.History.Count == History.Count &&
                other.History.All(History.Contains);
        }

        public override bool Equals(object obj)
        {
            if ((obj == null) || !GetType().Equals(obj.GetType()))
            {
                return false;
            }
            else
            {
                UserRole other = obj as UserRole;
                return other.Id.Equals(Id) && ContentEquals(other);
            }
        }
    }

    public enum Permission
    {
        //placeholders
        permission1,
        permission2,
        permission3
    }

    public enum GoalId
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

    public class History
    {
        [BsonElement("goalId")]
        public GoalId GoalId { get; set; }
        [BsonElement("numSteps")]
        public int NumSteps { get; set; }
        [BsonElement("stepData")]
        public dynamic StepData { get; set; }

        public History Clone()
        {
            History clone = new History
            {
                GoalId = GoalId,
                NumSteps = NumSteps,
                StepData = StepData.Clone() as dynamic
            };

            return clone;
        }
    }
}