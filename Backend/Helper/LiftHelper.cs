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
                entry.Traits.Any(t => !t.Name.Equals("morph-type", StringComparison.OrdinalIgnoreCase)
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
                if (t.Name.Equals("morph-type", StringComparison.OrdinalIgnoreCase))
                {
                    if (!t.Value.Equals("stem", StringComparison.OrdinalIgnoreCase))
                    {
                        reasons.Add(new() { Type = ReasonType.TraitMorphType, Value = t.Value });
                    }
                }
                else
                {
                    reasons.Add(new() { Type = ReasonType.Trait, Value = t.Name });
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
                sense.Traits.Any(t => !t.Name.StartsWith("semantic-domain", StringComparison.OrdinalIgnoreCase));
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
            if (sense.Reversals.Count > 0)
            {
                reasons.Add(new() { Type = ReasonType.Reversals, Count = sense.Reversals.Count });
            }
            if (sense.Subsenses.Count > 0)
            {
                reasons.Add(new() { Type = ReasonType.Subsenses, Count = sense.Subsenses.Count });
            }
            sense.Traits.ForEach(t =>
            {
                if (!t.Name.StartsWith("semantic-domain", StringComparison.OrdinalIgnoreCase))
                {
                    reasons.Add(new() { Type = ReasonType.Trait, Value = t.Name });
                }
            });

            return reasons;
        }
    }
}
