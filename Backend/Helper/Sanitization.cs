using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;

namespace BackendFramework.Helper
{
    public static class Sanitization
    {
        /// <summary>
        /// Validate that an ID field sent from a user does not contain any illegal characters.
        ///
        /// This is especially important if, for example, user input ultimately is used in the creation of a path to
        /// disk.
        /// </summary>
        public static bool SanitizeId(string id)
        {
            return id.All(c => char.IsLetterOrDigit(c) || c == '-');
        }

        /// <summary>
        /// Validate that a file name does not have any illegal characters (such as / or \) which could manipulate
        /// the path of files that are stored or retrieved.
        /// </summary>
        public static bool SanitizeFileName(string fileName)
        {
            // For list of invalid characters per OS, see https://stackoverflow.com/a/31976060.
            var validCharacters = new List<char>
            {
                '-',
                '.',
                '_',
                ',',
                '(',
                ')',
                ' '
            }.ToImmutableList();
            return fileName.All(c => char.IsLetterOrDigit(c) || validCharacters.Contains(c));
        }
    }
}
