using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.Serialization;
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
        public static List<string> GetProtectedReasons(LiftEntry entry)
        {
            var reasons = new List<string>();
            if (entry.Annotations.Count > 0)
            {
                reasons.Add("annotations");
            }
            if (entry.Etymologies.Count > 0)
            {
                reasons.Add("etymologies");
            }
            entry.Fields.ForEach(f =>
            {
                reasons.Add($"{f.Type} field");
            });
            if (entry.Notes.Count == 1 && !string.IsNullOrEmpty(entry.Notes.First().Type))
            {
                reasons.Add($"note with type {entry.Notes.First().Type}");
            }
            if (entry.Notes.Count > 1)
            {
                reasons.Add("more than 1 note");
            }
            if (entry.Relations.Count > 0)
            {
                reasons.Add("relations");
            }
            entry.Traits.ForEach(t =>
            {
                if (t.Name.Equals("morph-type", StringComparison.OrdinalIgnoreCase))
                {
                    if (!t.Value.Equals("stem", StringComparison.OrdinalIgnoreCase))
                    {
                        reasons.Add($"morph-type trait \"{t.Value}\" (rather than default \"stem\")");
                    }
                }
                else
                {
                    reasons.Add($"{t.Name} trait \"{t.Value}\"");
                }
            });
            if (entry.Variants.Count > 0)
            {
                reasons.Add("variants");
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
        public static List<string> GetProtectedReasons(LiftSense sense)
        {
            var reasons = new List<string>();
            if (sense.Annotations.Count > 0)
            {
                reasons.Add("annotations");
            }
            if (sense.Examples.Count > 0)
            {
                reasons.Add("examples");
            }
            sense.Fields.ForEach(f =>
            {
                reasons.Add($"{f.Type} field");
            });
            if (sense.GramInfo is not null && sense.GramInfo.Traits.Count > 0)
            {
                reasons.Add("more than 1 grammatical info trait");
            }
            if (sense.Illustrations.Count > 0)
            {
                reasons.Add("illustrations");
            }
            if (sense.Notes.Count > 0)
            {
                reasons.Add("notes");
            }
            if (sense.Relations.Count > 0)
            {
                reasons.Add("relations");
            }
            if (sense.Reversals.Count > 0)
            {
                reasons.Add("reversals");
            }
            if (sense.Subsenses.Count > 0)
            {
                reasons.Add("subsenses");
            }
            sense.Traits.ForEach(t =>
            {
                if (!t.Name.StartsWith("semantic-domain", StringComparison.OrdinalIgnoreCase))
                {
                    reasons.Add($"{t.Name} trait \"{t.Value}\"");
                }
            });

            return reasons;
        }
    }
}
