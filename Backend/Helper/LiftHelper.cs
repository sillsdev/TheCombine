using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.Serialization;
using BackendFramework.Models;
using SIL.Lift.Parsing;

namespace BackendFramework.Helper
{
    [Serializable]
    public class InvalidLiftFileException : InvalidFileException
    {
        public InvalidLiftFileException(string message) : base("Malformed LIFT file: " + message) { }

        protected InvalidLiftFileException(SerializationInfo info, StreamingContext context)
            : base(info, context) { }

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
                (entry.Notes.Count == 1 && !string.IsNullOrEmpty(entry.Notes.First().Type)) ||
                entry.Notes.Count > 1 || entry.Relations.Count > 0 ||
                entry.Traits.Any(t => !t.Name.Replace("-", "").Equals("morphtype", StringComparison.OrdinalIgnoreCase)
                    || !t.Value.Equals("stem", StringComparison.OrdinalIgnoreCase)) ||
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
            if (entry.Relations.Count > 0)
            {
                reasons.Add(new() { Type = ReasonType.Relations, Count = entry.Relations.Count });
            }
            entry.Traits.ForEach(t =>
            {
                // FieldWorks/Src/LexText/LexTextControls/LiftMerger.cs > ProcessEntryTraits()
                // FieldWorks/Src/LexText/LexTextControls/LiftExporter.cs > RangeNames
                switch (t.Name.Replace("-", "").ToLowerInvariant())
                {
                    case "dialectlabels":
                        reasons.Add(new() { Type = ReasonType.TraitDialectLabels, Value = t.Value });
                        break;
                    case "donotpublishin":
                        reasons.Add(new() { Type = ReasonType.TraitDoNotPublishIn, Value = t.Value });
                        break;
                    case "donotuseforparsing":
                        reasons.Add(new() { Type = ReasonType.TraitDoNotUseForParsing, Value = t.Value });
                        break;
                    case "entrytype":
                        reasons.Add(new() { Type = ReasonType.TraitEntryType, Value = t.Value });
                        break;
                    case "excludeasheadword":
                        reasons.Add(new() { Type = ReasonType.TraitExcludeAsHeadword });
                        break;
                    case "minorentrycondition":
                        reasons.Add(new() { Type = ReasonType.TraitMinorEntryCondition, Value = t.Value });
                        break;
                    case "morphtype":
                        if (!t.Value.Equals("stem", StringComparison.OrdinalIgnoreCase))
                        {
                            reasons.Add(new() { Type = ReasonType.TraitMorphType, Value = t.Value });
                        }
                        break;
                    case "publishin":
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
                // FieldWorks/Src/LexText/LexTextControls/LiftMerger.cs > ProcessSenseTraits()
                // FieldWorks/Src/LexText/LexTextControls/LiftExporter.cs > RangeNames
                switch (t.Name.Replace("-", "").ToLowerInvariant())
                {
                    case "anthrocode":
                        reasons.Add(new() { Type = ReasonType.TraitAnthroCode, Value = t.Value });
                        break;
                    case "domaintype":
                        reasons.Add(new() { Type = ReasonType.TraitDomainType, Value = t.Value });
                        break;
                    case "donotpublishin":
                        reasons.Add(new() { Type = ReasonType.TraitDoNotPublishIn, Value = t.Value });
                        break;
                    case "publishin":
                        reasons.Add(new() { Type = ReasonType.TraitPublishIn, Value = t.Value });
                        break;
                    case "semanticdomain":
                    case "semanticdomainddp4":
                        break;
                    case "sensetype":
                        reasons.Add(new() { Type = ReasonType.TraitSenseType, Value = t.Value });
                        break;
                    case "status":
                        reasons.Add(new() { Type = ReasonType.TraitStatus, Value = t.Value });
                        break;
                    case "usagetype":
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
