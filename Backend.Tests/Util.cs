using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using BackendFramework.Models;

namespace Backend.Tests
{
    public static class Util
    {
        /// <summary> Path to Assets directory from debugging folder </summary>
        public static readonly string AssetsDir = Path.Combine(Directory.GetParent(Directory.GetParent(
            Directory.GetParent(Environment.CurrentDirectory).ToString()).ToString()).ToString(), "Assets");

        public static string RandString(int length)
        {
            var rnd = new Random();
            var sb = new StringBuilder();
            for (var i = 0; i < length; i++)
            {
                if (i % 4 == 0)
                    sb.Append((char)rnd.Next('A', 'Z'));
                else
                    sb.Append((char)rnd.Next('a', 'z'));
            }
            return sb.ToString();
        }
        public static string RandString()
        {
            var rnd = new Random();
            return RandString(rnd.Next(4, 10));
        }

        public static Word RandomWord(string? projId = null)
        {
            return new Word
            {
                Created = RandString(),
                Vernacular = RandString(),
                Modified = RandString(),
                PartOfSpeech = RandString(),
                Plural = RandString(),
                History = new List<string>(),
                Audio = new List<string>(),
                EditedBy = new List<string> { RandString(), RandString() },
                ProjectId = projId ?? RandString(),
                Senses = new List<Sense> { RandomSense(), RandomSense(), RandomSense() },
                Note = new Note { Language = RandString(), Text = RandString() }
            };
        }

        public static Sense RandomSense()
        {
            return new Sense
            {
                Accessibility = State.Active,
                Glosses = new List<Gloss> { RandomGloss(), RandomGloss(), RandomGloss() },
                SemanticDomains = new List<SemanticDomain>
                {
                    RandomSemanticDomain(),
                    RandomSemanticDomain(),
                    RandomSemanticDomain()
                },
            };
        }

        public static Gloss RandomGloss()
        {
            return new Gloss
            {
                Def = RandString(),
                Language = RandString(3),
            };
        }

        public static SemanticDomain RandomSemanticDomain(string? id = null)
        {
            return new SemanticDomain
            {
                Name = RandString(),
                Id = id ?? RandString(),
                Description = RandString(),
            };
        }

        public static Project RandomProject()
        {
            var project = new Project
            {
                Name = Util.RandString(),
                VernacularWritingSystem = RandomWritingSystem(),
                AnalysisWritingSystems = new List<WritingSystem> { RandomWritingSystem() },
                SemanticDomains = new List<SemanticDomain>()
            };
            for (var i = 1; i < 4; i++)
            {
                project.SemanticDomains.Add(RandomSemanticDomain($"{i}"));
                for (var j = 1; j < 4; j++)
                {
                    project.SemanticDomains.Add(RandomSemanticDomain($"{i}.{j}"));
                    for (var k = 1; k < 4; k++)
                    {
                        project.SemanticDomains.Add(RandomSemanticDomain($"{i}.{j}.{k}"));
                    }
                }
            }
            return project;
        }

        public static WritingSystem RandomWritingSystem()
        {
            return new WritingSystem
            {
                Name = RandString(),
                Bcp47 = RandString(),
                Font = RandString()
            };
        }
    }
}
