using System;
using System.Linq;
using SIL.Lift.Parsing;

namespace BackendFramework.Helper
{
    public class LiftHelper
    {
        /// <summary>
        /// Determine if a <see cref="LiftEntry"/> has any data not handled by The Combine.
        /// </summary>
        public static bool IsProtected(LiftEntry entry)
        {
            return entry.Annotations.Count > 0 || entry.Etymologies.Count > 0 || entry.Fields.Count > 0 ||
                (entry.Notes.Count == 1 && !String.IsNullOrEmpty(entry.Notes.First().Type)) ||
                entry.Notes.Count > 1 || entry.Pronunciations.Count > 0 || entry.Relations.Count > 0 ||
                entry.Traits.Any(t => !t.Value.Equals("stem")) || entry.Variants.Count > 0;
        }

        /// <summary>
        /// Determine if a <see cref="LiftSense"/> has any data not handled by The Combine.
        /// </summary>
        public static bool IsProtected(LiftSense sense)
        {
            return sense.Examples.Count > 0 || sense.Fields.Count > 0 || sense.GramInfo is not null ||
                sense.Illustrations.Count > 0 || sense.Notes.Count > 0 || sense.Relations.Count > 0 ||
                sense.Reversals.Count > 0 || sense.Subsenses.Count > 0 ||
                (sense.Traits.Any(t => !t.Name.StartsWith("semantic-domain")));
        }
    }
}
