using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

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
    }
}