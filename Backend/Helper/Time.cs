using System;

namespace BackendFramework.Helper
{
    public static class Time
    {
        /// <summary>
        /// Construct a string for the current DateTime in the UTC timezone formatted in ISO 8601 format.
        /// </summary>
        /// <remarks>
        /// This format is suitable for storage into the database because it is possible to round trip the strings
        /// because they retain timezone information.
        /// </remarks>
        public static string UtcNowIso8601()
        {
            return DateTime.UtcNow.ToString("o");
        }
    }
}

