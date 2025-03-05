using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using BackendFramework.Models;
using SIL.Lift.Parsing;

namespace BackendFramework.Helper
{
    public class InvalidLiftFileException : InvalidFileException
    {
        public InvalidLiftFileException(string message) : base("Malformed LIFT file: " + message) { }
    }

    public static class TraitNames
    {
        public const string AnthroCode = "anthrocode";
        public const string DialectLabels = "dialectlabels";
        public const string DomainType = "domaintype";
        public const string DoNotPublishIn = "donotpublishin";
        public const string DoNotUseForParsing = "donotuseforparsing";
        public const string EntryType = "entrytype";
        public const string ExcludeAsHeadWord = "excludeasheadword";
        public const string MinorEntryCondition = "minorentrycondition";
        public const string MorphType = "morphtype";
        public const string PublishIn = "publishin";
        public const string SemanticDomain = "semanticdomain";
        public const string SemanticDomainDdp4 = "semanticdomainddp4";
        public const string SenseType = "sensetype";
        public const string Status = "status";
        public const string UsageType = "usagetype";
    }

    public static class LiftHelper
    {
        public static string GetLiftRootFromExtractedZip(string dirPath)
        {
            // Search for .lift files to determine the root of the Lift project.
            string extractedLiftRootPath;
            // Handle this structuring case:
            // extractedZipDir
            //    | audio
            //    | WritingSystems
            //    | project_name.lift
            //    | project_name.lift-ranges
            if (FileOperations.FindFilesWithExtension(dirPath, ".lift").Count > 0)
            {
                extractedLiftRootPath = dirPath;
            }
            // Handle the typical structuring case:
            // extractedZipDir
            //    | project_name
            //      | audio
            //      | WritingSystems
            //      | project_name.lift
            //      | project_name.lift-ranges
            else
            {
                extractedLiftRootPath = Directory.GetDirectories(dirPath).First();
            }

            // Validate that only one .lift file is included.
            var extractedLiftFiles = FileOperations.FindFilesWithExtension(extractedLiftRootPath, ".lift");
            switch (extractedLiftFiles.Count)
            {
                case 0:
                    throw new InvalidLiftFileException("No .lift files detected.");
                case > 1:
                    throw new InvalidLiftFileException("More than one .lift file detected.");
            }

            return extractedLiftRootPath;
        }

        /// <summary> Determine if a <see cref="LiftEntry"/> has any data not handled by The Combine. </summary>
        public static bool IsProtected(LiftEntry entry)
        {
            return entry.Annotations.Count > 0 || entry.Etymologies.Count > 0 || entry.Fields.Count > 0 ||
                (entry.Notes.Count == 1 && !string.IsNullOrEmpty(entry.Notes.First().Type)) || entry.Notes.Count > 1 ||
                entry.Pronunciations.Any(p => p.Media.All(m => string.IsNullOrEmpty(m.Url))) ||
                entry.Relations.Count > 0 ||
                entry.Traits.Any(t => !t.Value.Equals("stem", StringComparison.OrdinalIgnoreCase) ||
                    !t.Name.Replace("-", "").Equals(TraitNames.MorphType, StringComparison.OrdinalIgnoreCase)) ||
                entry.Variants.Count > 0;
        }

        /// <summary> Determine what <see cref="LiftEntry"/> data is not handled by The Combine. </summary>
        public static List<ProtectReason> GetProtectedReasons(LiftEntry entry)
        {
            var reasons = new List<ProtectReason>();
            if (entry.Annotations.Count > 0)
            {
                reasons.Add(new() { Type = ReasonType.Annotations, Count = entry.Annotations.Count });
            }
            if (entry.Etymologies.Count > 0)
            {
                reasons.Add(new() { Type = ReasonType.Etymologies, Count = entry.Etymologies.Count });
            }
            entry.Fields.ForEach(f =>
            {
                reasons.Add(new() { Type = ReasonType.Field, Value = f.Type });
            });
            if (entry.Notes.Count == 1 && !string.IsNullOrEmpty(entry.Notes.First().Type))
            {
                reasons.Add(new() { Type = ReasonType.NoteWithType, Value = entry.Notes.First().Type });
            }
            if (entry.Notes.Count > 1)
            {
                reasons.Add(new() { Type = ReasonType.Notes, Count = entry.Notes.Count });
            }
            if (entry.Pronunciations.Any(p => p.Media.All(m => string.IsNullOrEmpty(m.Url))))
            {
                reasons.Add(new() { Type = ReasonType.PronunciationWithoutUrl });
            }
            if (entry.Relations.Count > 0)
            {
                reasons.Add(new() { Type = ReasonType.Relations, Count = entry.Relations.Count });
            }
            entry.Traits.ForEach(t =>
            {
                // FieldWorks > Src/LexText/LexTextControls/LiftMerger.cs > ProcessEntryTraits()
                // FieldWorks > Src/LexText/LexTextControls/LiftExporter.cs > RangeNames
                switch (t.Name.Replace("-", "").ToLowerInvariant())
                {
                    case TraitNames.DialectLabels:
                        reasons.Add(new() { Type = ReasonType.TraitDialectLabels, Value = t.Value });
                        break;
                    case TraitNames.DoNotPublishIn:
                        reasons.Add(new() { Type = ReasonType.TraitDoNotPublishIn, Value = t.Value });
                        break;
                    case TraitNames.DoNotUseForParsing:
                        reasons.Add(new() { Type = ReasonType.TraitDoNotUseForParsing, Value = t.Value });
                        break;
                    case TraitNames.EntryType:
                        reasons.Add(new() { Type = ReasonType.TraitEntryType, Value = t.Value });
                        break;
                    case TraitNames.ExcludeAsHeadWord:
                        reasons.Add(new() { Type = ReasonType.TraitExcludeAsHeadword });
                        break;
                    case TraitNames.MinorEntryCondition:
                        reasons.Add(new() { Type = ReasonType.TraitMinorEntryCondition, Value = t.Value });
                        break;
                    case TraitNames.MorphType:
                        if (!t.Value.Equals("stem", StringComparison.OrdinalIgnoreCase))
                        {
                            reasons.Add(new() { Type = ReasonType.TraitMorphType, Value = t.Value });
                        }
                        break;
                    case TraitNames.PublishIn:
                        reasons.Add(new() { Type = ReasonType.TraitPublishIn, Value = t.Value });
                        break;
                    default:
                        reasons.Add(new() { Type = ReasonType.Trait, Value = $"{t.Name} \"{t.Value}\"" });
                        break;
                }
            });
            if (entry.Variants.Count > 0)
            {
                reasons.Add(new() { Type = ReasonType.Variants, Count = entry.Variants.Count });
            }

            return reasons;
        }

        /// <summary> Determine if a <see cref="LiftSense"/> has any data not handled by The Combine. </summary>
        public static bool IsProtected(LiftSense sense)
        {
            return sense.Annotations.Count > 0 || sense.Examples.Count > 0 || sense.Fields.Count > 0 ||
                sense.GramInfo is not null && sense.GramInfo.Traits.Count > 0 ||
                sense.Illustrations.Count > 0 || sense.Notes.Count > 0 || sense.Relations.Count > 0 ||
                sense.Reversals.Count > 0 || sense.Subsenses.Count > 0 ||
                sense.Traits.Any(
                    t => !t.Name.Replace("-", "").StartsWith("semanticdomain", StringComparison.OrdinalIgnoreCase));
        }

        /// <summary> Determine what <see cref="LiftSense"/> data is not handled by The Combine. </summary>
        public static List<ProtectReason> GetProtectedReasons(LiftSense sense)
        {
            var reasons = new List<ProtectReason>();
            if (sense.Annotations.Count > 0)
            {
                reasons.Add(new() { Type = ReasonType.Annotations, Count = sense.Annotations.Count });
            }
            if (sense.Examples.Count > 0)
            {
                reasons.Add(new() { Type = ReasonType.Examples, Count = sense.Examples.Count });
            }
            sense.Fields.ForEach(f =>
            {
                reasons.Add(new() { Type = ReasonType.Field, Value = f.Type });
            });
            sense.GramInfo?.Traits.ForEach(t =>
            {
                reasons.Add(new() { Type = ReasonType.GramInfoTrait, Value = t.Name });
            });
            if (sense.Illustrations.Count > 0)
            {
                reasons.Add(new() { Type = ReasonType.Illustrations, Count = sense.Illustrations.Count });
            }
            if (sense.Notes.Count > 0)
            {
                reasons.Add(new() { Type = ReasonType.Notes, Count = sense.Notes.Count });
            }
            if (sense.Relations.Count > 0)
            {
                reasons.Add(new() { Type = ReasonType.Relations, Count = sense.Relations.Count });
            }
            sense.Reversals.ForEach(r =>
            {
                reasons.Add(new() { Type = ReasonType.Reversals, Value = r.Type });
            });
            if (sense.Subsenses.Count > 0)
            {
                reasons.Add(new() { Type = ReasonType.Subsenses, Count = sense.Subsenses.Count });
            }
            sense.Traits.ForEach(t =>
            {
                // FieldWorks > Src/LexText/LexTextControls/LiftMerger.cs > ProcessSenseTraits()
                // FieldWorks > Src/LexText/LexTextControls/LiftExporter.cs > RangeNames
                switch (t.Name.Replace("-", "").ToLowerInvariant())
                {
                    case TraitNames.AnthroCode:
                        reasons.Add(new() { Type = ReasonType.TraitAnthroCode, Value = t.Value });
                        break;
                    case TraitNames.DomainType:
                        reasons.Add(new() { Type = ReasonType.TraitDomainType, Value = t.Value });
                        break;
                    case TraitNames.DoNotPublishIn:
                        reasons.Add(new() { Type = ReasonType.TraitDoNotPublishIn, Value = t.Value });
                        break;
                    case TraitNames.PublishIn:
                        reasons.Add(new() { Type = ReasonType.TraitPublishIn, Value = t.Value });
                        break;
                    case TraitNames.SemanticDomain:
                    case TraitNames.SemanticDomainDdp4:
                        break;
                    case TraitNames.SenseType:
                        reasons.Add(new() { Type = ReasonType.TraitSenseType, Value = t.Value });
                        break;
                    case TraitNames.Status:
                        reasons.Add(new() { Type = ReasonType.TraitStatus, Value = t.Value });
                        break;
                    case TraitNames.UsageType:
                        reasons.Add(new() { Type = ReasonType.TraitUsageType, Value = t.Value });
                        break;
                    default:
                        reasons.Add(new() { Type = ReasonType.Trait, Value = $"{t.Name} ({t.Value})" });
                        break;
                }
            });
            return reasons;
        }
    }
}
