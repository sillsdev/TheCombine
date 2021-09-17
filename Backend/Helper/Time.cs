using System;

namespace BackendFramework.Helper
{
    public static class Time
    {
        // https://docs.microsoft.com/en-us/dotnet/standard/base-types/standard-date-and-time-format-strings#Roundtrip
        private const string RoundTripIso8601Format = "o";

        /// <summary>
        /// Construct a string for the current DateTime in the UTC timezone formatted in ISO 8601 format.
        /// </summary>
        /// <remarks>
        /// This format is suitable for storage into the database because it is possible to round trip the strings
        /// because they retain timezone information.
        /// </remarks>
        public static string UtcNowIso8601()
        {
            return DateTime.UtcNow.ToString(RoundTripIso8601Format);
        }

        /// <summary>
        /// Convert a DateTime into a UTC timezone ISO 8601 formatted string.
        /// </summary>
        public static string ToUtcIso8601(DateTime dateTime)
        {
            return dateTime.ToString(RoundTripIso8601Format);
        }
    }
}

