using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using BackendFramework.Models;
using NUnit.Framework;
using static System.Linq.Enumerable;

namespace Backend.Tests
{
    public static class Util
    {
        /// <summary> Path to Assets directory from debugging folder </summary>
        public static readonly string AssetsDir = Path.Combine(Directory.GetParent(Directory.GetParent(
            Directory.GetParent(Environment.CurrentDirectory)!.ToString())!.ToString())!.ToString(), "Assets");

        public static string RandString(int length)
        {
            var rnd = new Random();
            var sb = new StringBuilder();
            foreach (var i in Range(0, length))
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

        public static List<Word> RandomWordList(int length, string? projId = null)
        {
            var wordList = new List<Word>();
            foreach (var i in Range(0, length))
            {
                var word = RandomWord(projId);
                word.Vernacular += i;
                wordList.Add(word);
            }
            return wordList;
        }

        public static Word RandomWord(string? projId = null)
        {
            return new()
            {
                Id = RandString(),
                Created = RandString(),
                Vernacular = RandString(),
                Modified = RandString(),
                EditedBy = [RandString(), RandString()],
                ProjectId = projId ?? RandString(),
                Senses = [RandomSense(), RandomSense(), RandomSense()],
                Note = new() { Language = RandString(), Text = RandString() }
            };
        }

        public static Sense RandomSense()
        {
            return new()
            {
                Accessibility = Status.Active,
                GrammaticalInfo = new GrammaticalInfo(RandString()),
                Glosses = [RandomGloss(), RandomGloss(), RandomGloss()],
                SemanticDomains = [RandomSemanticDomain(), RandomSemanticDomain(), RandomSemanticDomain()]
            };
        }

        public static Definition RandomDefinition()
        {
            return new() { Text = RandString(), Language = RandString(3) };
        }

        public static Gloss RandomGloss()
        {
            return new() { Def = RandString(), Language = RandString(3) };
        }

        public static SemanticDomain RandomSemanticDomain(string? id = null)
        {
            return new() { Name = RandString(), Id = id ?? RandString(), };
        }

        public static Project RandomProject()
        {
            var project = new Project
            {
                Name = RandString(),
                VernacularWritingSystem = RandomWritingSystem(),
                AnalysisWritingSystems = [RandomWritingSystem()],
            };

            const int numSemanticDomains = 3;
            foreach (var i in Range(1, numSemanticDomains))
            {
                project.SemanticDomains.Add(new(RandomSemanticDomain($"{i}")));
                foreach (var j in Range(1, numSemanticDomains))
                {
                    project.SemanticDomains.Add(new(RandomSemanticDomain($"{i}.{j}")));
                    foreach (var k in Range(1, numSemanticDomains))
                    {
                        project.SemanticDomains.Add(new(RandomSemanticDomain($"{i}.{j}.{k}")));
                    }
                }
            }
            return project;
        }

        public static WritingSystem RandomWritingSystem()
        {
            return new(RandString(), RandString(), RandString());
        }

        /// <summary>
        /// Asserts whether two Words have the same content.
        /// Ignores metadata: Created, EditedBy, History, Id, Modified.
        /// </summary>
        public static void AssertEqualWordContent(Word wordA, Word wordB, bool isEqual)
        {
            var aClone = wordA.Clone();
            aClone.Created = wordB.Created;
            aClone.EditedBy = wordB.EditedBy;
            aClone.History = wordB.History;
            aClone.Id = wordB.Id;
            aClone.Modified = wordB.Modified;
            if (isEqual)
            {
                Assert.That(aClone, Is.EqualTo(wordB).UsingPropertiesComparer());
            }
            else
            {
                Assert.That(aClone, Is.Not.EqualTo(wordB).UsingPropertiesComparer());
            }
        }
    }
}
