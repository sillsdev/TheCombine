﻿using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Http;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BackendFramework.Models
{
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
        public List<string> Audio { get; set; }

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

        [BsonElement("otherField")]
        public string OtherField { get; set; }

        [BsonElement("projectId")]
        public string ProjectId { get; set; }

        public Word()
        {
            Id = "";
            Vernacular = "";
            Plural = "";
            Created = "";
            Modified = "";
            PartOfSpeech = "";
            OtherField = "";
            ProjectId = "";
            Audio = new List<string>();
            EditedBy = new List<string>();
            History = new List<string>();
            Senses = new List<Sense>();
        }

        public Word Clone()
        {
            var clone = new Word
            {
                Id = Id.Clone() as string,
                Vernacular = Vernacular.Clone() as string,
                Plural = Plural.Clone() as string,
                Created = Created.Clone() as string,
                Modified = Modified.Clone() as string,
                PartOfSpeech = PartOfSpeech.Clone() as string,
                OtherField = OtherField.Clone() as string,
                ProjectId = ProjectId.Clone() as string,
                Audio = new List<string>(),
                EditedBy = new List<string>(),
                History = new List<string>(),
                Senses = new List<Sense>()
            };

            foreach (var file in Audio)
            {
                clone.Audio.Add(file.Clone() as string);
            }
            foreach (var id in EditedBy)
            {
                clone.EditedBy.Add(id.Clone() as string);
            }
            foreach (var id in History)
            {
                clone.History.Add(id.Clone() as string);
            }
            foreach (var sense in Senses)
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
                other.PartOfSpeech.Equals(PartOfSpeech) &&
                other.OtherField.Equals(OtherField) &&
                other.ProjectId.Equals(ProjectId) &&

                other.Audio.Count == Audio.Count &&
                other.Audio.All(Audio.Contains) &&

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
                var other = obj as Word;
                return
                    other.Id.Equals(Id) &&
                    this.ContentEquals(other) &&
                    other.Created.Equals(Created) &&
                    other.Modified.Equals(Modified) &&
                    other.EditedBy.Count == EditedBy.Count &&
                    other.EditedBy.All(EditedBy.Contains) &&
                    other.History.Count == History.Count &&
                    other.History.All(History.Contains);
            }
        }

        public override int GetHashCode()
        {
            var hash = new HashCode();
            hash.Add(Id);
            hash.Add(Vernacular);
            hash.Add(Plural);
            hash.Add(Senses);
            hash.Add(Audio);
            hash.Add(Created);
            hash.Add(Modified);
            hash.Add(History);
            hash.Add(PartOfSpeech);
            hash.Add(EditedBy);
            hash.Add(OtherField);
            hash.Add(ProjectId);
            return hash.ToHashCode();
        }
    }

    public class Sense
    {
        [BsonElement("Glosses")]
        public List<Gloss> Glosses { get; set; }

        [BsonElement("SemanticDomains")]
        public List<SemanticDomain> SemanticDomains { get; set; }

        [BsonElement("accessibility")]
        public int Accessibility { get; set; }

        public Sense Clone()
        {
            var clone = new Sense
            {
                Glosses = new List<Gloss>(),
                SemanticDomains = new List<SemanticDomain>()
            };

            foreach (var gloss in Glosses)
            {
                clone.Glosses.Add(gloss.Clone());
            }
            foreach (var sd in SemanticDomains)
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
                var other = obj as Sense;
                return
                    other.Glosses.Count == Glosses.Count &&
                    other.Glosses.All(Glosses.Contains) &&

                    other.SemanticDomains.Count == SemanticDomains.Count &&
                    other.SemanticDomains.All(SemanticDomains.Contains);
            }
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Glosses, SemanticDomains);
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
                var other = obj as Gloss;
                return Language.Equals(other.Language) && Def.Equals(other.Def);
            }
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Language, Def);
        }
    }

    public class SemanticDomain
    {
        public string Name { get; set; }
        public string Id { get; set; }
        public string Description { get; set; }

        public SemanticDomain Clone()
        {
            return new SemanticDomain
            {
                Name = Name.Clone() as string,
                Id = Id.Clone() as string,
                Description = Description.Clone() as string
            };
        }

        public SemanticDomain()
        {
            Name = "";
            Id = "";
            Description = "";
        }

        public override bool Equals(object obj)
        {
            if ((obj == null) || !this.GetType().Equals(obj.GetType()))
            {
                return false;
            }
            else
            {
                var other = obj as SemanticDomain;
                return Name.Equals(other.Name) && Id.Equals(other.Id) && Description.Equals(other.Description);
            }
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Name, Id, Description);
        }
    }

    /// <summary> Helper object that contains a file along with its name and path </summary>
    public class FileUpload
    {
        public IFormFile File { get; set; }
        public string Name { get; set; }
        public string FilePath { get; set; }
    }

    /// <summary>
    /// Helper object that contains a parent word and a number of children which will be merged into it
    /// along with the userId of who made the merge and at what time
    /// </summary>
    public class MergeWords
    {
        public Word Parent { get; set; }
        public List<MergeSourceWord> ChildrenWords { get; set; }
        public string MergedBy { get; set; }
        public string Time { get; set; }
    }

    /// <summary> Helper object that contains a wordId and the type of merge that should be performed </summary>
    public class MergeSourceWord
    {
        public string SrcWordId;
        public List<State> SenseStates;
    }

    /// <summary> Information about the state of the word in that database used for merging </summary>
    public enum State
    {
        Active,
        Deleted,
        Sense,
        Duplicate,
        Separate
    }
}
