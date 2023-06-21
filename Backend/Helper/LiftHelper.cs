using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using SIL.Lift.Parsing;

namespace BackendFramework.Helper
{
    public class LiftHelper
    {

        /// <summary> Find any .lift files within a directory. </summary>
        public static List<string> FindLiftFiles(string dir, bool recursive = false)
        {
            var liftFiles = Directory.GetFiles(dir, "*.lift").ToList();
            if (recursive)
            {
                Directory.GetDirectories(dir).ToList()
                    .ForEach(subDir => liftFiles.AddRange(FindLiftFiles(subDir, true)));
            }
            return liftFiles;
        }

        /// <summary>
        /// Determine if a <see cref="LiftEntry"/> has any data not handled by The Combine.
        /// </summary>
        public static bool IsProtected(LiftEntry entry)
        {
            return entry.Annotations.Count > 0 || entry.Etymologies.Count > 0 || entry.Fields.Count > 0 ||
                (entry.Notes.Count == 1 && !String.IsNullOrEmpty(entry.Notes.First().Type)) ||
                entry.Notes.Count > 1 || entry.Pronunciations.Count > 0 || entry.Relations.Count > 0 ||
                entry.Traits.Any(t => !t.Value.Equals("stem", StringComparison.OrdinalIgnoreCase)) ||
                entry.Variants.Count > 0;
        }

        /// <summary>
        /// Determine if a <see cref="LiftSense"/> has any data not handled by The Combine.
        /// </summary>
        public static bool IsProtected(LiftSense sense)
        {
            return sense.Examples.Count > 0 || sense.Fields.Count > 0 ||
                sense.GramInfo is not null && sense.GramInfo.Traits.Count > 0 ||
                sense.Illustrations.Count > 0 || sense.Notes.Count > 0 || sense.Relations.Count > 0 ||
                sense.Reversals.Count > 0 || sense.Subsenses.Count > 0 ||
                (sense.Traits.Any(t => !t.Name.StartsWith("semantic-domain", StringComparison.OrdinalIgnoreCase)));
        }
    }
}
