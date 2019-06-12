using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;

namespace BackendFramework.ValueModels
{
    public enum state
    {
        active,
        deleted,
        sense,
        duplicate
    }
    public class Word
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("Vernacular")]
        public string Vernacular { get; set; }

        [BsonElement("Gloss")]
        public string Gloss { get; set; }

        [BsonElement("Audio")]
        public string Audio { get; set; }

        [BsonElement("Timestamp")]
        public string Timestamp { get; set; }

        [BsonElement("Created")]
        public string Created { get; set; }

        [BsonElement("Modified")]
        public string Modified { get; set; }

        [BsonElement("History")]
        public List<string> History { get; set; }

        [BsonElement("AudioFile")]
        public string AudioFile { get; set; }

        [BsonElement("PartOfSpeech")]
        public string PartOfSpeech { get; set; }

        [BsonElement("EditedBy")]
        public List<string> EditedBy { get; set; }

        [BsonElement("Accessability")]
        public int Accessability { get; set; }

        [BsonElement("OtherField")]
        public string OtherField { get; set; }

        public Word()
        {
            this.Id = "";
            this.Vernacular = "";
            this.Gloss = "";
            this.Audio = "";
            this.Timestamp = "";
            this.Created = "";
            this.Modified = "";
            this.History = new List<string>();
            this.AudioFile = "";
            this.PartOfSpeech = "";
            this.EditedBy = new List<string>();
            this.Accessability = (int)state.active;
            this.OtherField = "";
        }
        
        public override bool Equals(Object obj)
        {
            //Check for null and compare run-time types.
            if ((obj == null) || !this.GetType().Equals(obj.GetType()))
            {
                return false;
            }
            else
            {
                Word other = (Word)obj;
                return
                    this.Id.Equals(other.Id) &&
                    this.Vernacular.Equals(other.Vernacular) &&
                    this.Gloss.Equals(other.Gloss) &&
                    this.Audio.Equals(other.Audio) &&
                    this.Timestamp.Equals(other.Timestamp) &&
                    this.Created.Equals(other.Created) &&
                    this.Modified.Equals(other.Modified) &&
                    this.History.All(id => other.History.Contains(id)) &&
                    this.AudioFile.Equals(other.AudioFile) &&
                    this.PartOfSpeech.Equals(other.PartOfSpeech) &&
                    this.EditedBy.Equals(other.EditedBy) &&
                    this.Accessability.Equals(other.Accessability) &&
                    this.OtherField.Equals(other.OtherField);
            }
        }

        public bool ContentEquals(Object obj)
        {
            //Check for null and compare run-time types.
            if ((obj == null) || !this.GetType().Equals(obj.GetType()))
            {
                return false;
            }
            else
            {
                Word other = (Word)obj;
                return
                    this.Vernacular.Equals(other.Vernacular) &&
                    this.Gloss.Equals(other.Gloss) &&
                    this.Audio.Equals(other.Audio) &&
                    this.Timestamp.Equals(other.Timestamp) &&
                    this.Created.Equals(other.Created) &&
                    this.Modified.Equals(other.Modified) &&
                    this.History.Count == other.History.Count &&
                    this.History.All(id => other.History.Contains(id)) &&
                    this.AudioFile.Equals(other.AudioFile) &&
                    this.PartOfSpeech.Equals(other.PartOfSpeech) &&
                    this.EditedBy.Equals(other.EditedBy) &&
                    this.Accessability.Equals(other.Accessability) &&
                    this.OtherField.Equals(other.OtherField);
            }
        }

        public Word Copy()
        {
            Word copy = new Word
            {
                Id = this.Id.Clone() as string,
                Vernacular = this.Vernacular.Clone() as string,
                Gloss = this.Gloss.Clone() as string,
                Audio = this.Audio.Clone() as string,
                Timestamp = this.Timestamp.Clone() as string,
                Created = this.Created.Clone() as string,
                Modified = this.Modified.Clone() as string,
                History = new List<string>(),
                AudioFile = this.AudioFile.Clone() as string,
                PartOfSpeech = this.PartOfSpeech.Clone() as string,
                EditedBy = this.EditedBy,
                Accessability = this.Accessability,
                OtherField = this.OtherField
            };
            foreach (string id in this.History)
            {
                copy.History.Add(id.Clone() as string);
            }
            
            return copy;
        }

        public override string ToString()
        {
            return Id + ": " + Vernacular + "\t" + Gloss;
        }
    }
    public class MergeWords
    {
        public string parent { get; set; }
        public List<string> children { get; set; }
        public state mergeType { get; set; }
        public User mergedBy { get; set; }
        public string time { get; set; }
    }
}