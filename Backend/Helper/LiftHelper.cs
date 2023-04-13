using System;
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
                entry.Pronunciations.Count > 0 || entry.Relations.Count > 0 || entry.Traits.Count > 0 ||
                entry.Variants.Count > 0;
        }

        /// <summary>
        /// Determine if a <see cref="LiftSense"/> has any data not handled by The Combine.
        /// </summary>
        public static bool IsProtected(LiftSense sense)
        {
            return sense.Examples.Count > 0 || sense.Fields.Count > 0 || sense.GramInfo != null ||
                sense.Illustrations.Count > 0 || sense.Relations.Count > 0 || sense.Reversals.Count > 0 ||
                sense.Subsenses.Count > 0 || (sense.Traits.Find(t => !t.Name.StartsWith("semantic-domain")) != null);
        }
    }
}
