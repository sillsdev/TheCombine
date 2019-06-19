using Microsoft.AspNetCore.Http;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;

namespace BackendFramework.ValueModels
{
    public class FileUpload
    {
        public IFormFile file { get; set; }
        public string name { get; set; }
        public string filePath { get; set; }
    }


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

        [BsonElement("vernacular")]
        public string Vernacular { get; set; }

        [BsonElement("plural")]
        public string Plural { get; set; }

        [BsonElement("senses")]
        public List<Sense> Senses { get; set; }

        [BsonElement("audio")]
        public string Audio { get; set; }

        [BsonElement("created")]
        public string Created { get; set; }

        [BsonElement("modified")]
        public string Modified { get; set; }

        [BsonElement("history")]
        public List<string> History { get; set; }

        [BsonElement("partOfSpeech")]
        public string PartOfSpeech { get; set; }

        [BsonElement("editedBy")]
        public List<string> EditedBy { get; set; }

        [BsonElement("accessability")]
        public int Accessability { get; set; }

        [BsonElement("otherField")]
        public string OtherField { get; set; }

        public Word()
        {
            Id = "";
            Vernacular = "";
            Plural = "";
            Audio = "";
            Created = "";
            Modified = "";
            PartOfSpeech = "";
            Accessability = (int) state.active;
            OtherField = "";
            EditedBy = new List<string>();
            History = new List<string>();
            Senses = new List<Sense>();
        }

        public Word Clone()
        { 
            Word clone = new Word
            {
                Id = Id.Clone() as string,
                Vernacular = Vernacular.Clone() as string,
                Plural = Plural.Clone() as string,
                Audio = Audio.Clone() as string,
                Created = Created.Clone() as string,
                Modified = Modified.Clone() as string,
                PartOfSpeech = PartOfSpeech.Clone() as string,
                Accessability = Accessability,
                OtherField = OtherField.Clone() as string,
                EditedBy = new List<string>(),
                History = new List<string>(),
                Senses = new List<Sense>()
            };

            foreach (string id in EditedBy)
            {
                clone.EditedBy.Add(id.Clone() as string);
            }

            foreach(string id in History)
            {
                clone.History.Add(id.Clone() as string);
            }

            foreach(Sense sense in Senses)
            {
                clone.Senses.Add(sense.Clone());
            }

            return clone;
        }

        public bool ContentEquals(Word other)
        {
            return
                other.Vernacular.Equals(Vernacular) &&
                other.Plural.Equals(Plural) &&
                other.Audio.Equals(Audio) &&
                other.Created.Equals(Created) &&
                other.Modified.Equals(Modified) &&
                other.PartOfSpeech.Equals(PartOfSpeech) &&
                other.Accessability.Equals(Accessability) &&
                other.OtherField.Equals(OtherField) &&
                other.EditedBy.Count == EditedBy.Count &&
                other.EditedBy.All(EditedBy.Contains) &&
                other.History.Count == History.Count &&
                other.History.All(History.Contains) &&
                other.Senses.Count == Senses.Count &&
                other.Senses.All(Senses.Contains);
        }

        public override bool Equals(object obj)
        {
            if ((obj == null) || !GetType().Equals(obj.GetType()))
            {
                return false;
            }
            else
            {
                Word other = obj as Word;
                return other.Id.Equals(Id) && this.ContentEquals(other);
            }
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

    public class Sense
    {
        public List<Gloss> Glosses { get; set; }
        public List<SemanticDomain> SemanticDomains { get; set; }

        public Sense Clone()
        {
            Sense clone = new Sense
            {
                Glosses = new List<Gloss>(),
                SemanticDomains = new List<SemanticDomain>()
            };

            foreach (Gloss gloss in Glosses)
            {
                clone.Glosses.Add(gloss.Clone());
            }
            foreach(SemanticDomain sd in SemanticDomains)
            {
                clone.SemanticDomains.Add(sd.Clone());
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
                Sense other = obj as Sense;
                return
                    other.Glosses.Count == Glosses.Count &&
                    other.Glosses.All(Glosses.Contains) &&
                    other.SemanticDomains.Count == SemanticDomains.Count &&
                    other.SemanticDomains.All(SemanticDomains.Contains);
            }
        }
    }

    public class SemanticDomain
    {
        public string Name { get; set; }
        public string Number { get; set; }

        public SemanticDomain Clone()
        {
            return new SemanticDomain
            {
                Name = Name.Clone() as string,
                Number = Number.Clone() as string
            };
        }

        public override bool Equals(object obj)
        {
            if ((obj == null) || !this.GetType().Equals(obj.GetType()))
            {
                return false;
            }
            else
            {
                SemanticDomain other = obj as SemanticDomain;
                return Name.Equals(other.Name) && Number.Equals(other.Number);
            }
        }
    }

    public class Gloss
    {
        public string Language { get; set; }
        public string Def { get; set; }

        public Gloss Clone()
        {
            return new Gloss
            {
                Language = Language.Clone() as string,
                Def = Def.Clone() as string
            };
        }

        public override bool Equals(object obj)
        {
            if ((obj == null) || !this.GetType().Equals(obj.GetType()))
            {
                return false;
            }
            else
            {
                Gloss other = obj as Gloss;
                return Language.Equals(other.Language) && Def.Equals(other.Def);
            }
        }
    }
}