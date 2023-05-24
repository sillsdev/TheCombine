using System.Collections.Generic;
using System.Collections.Immutable;
using System.Globalization;
using System.Linq;
using System.Text;

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

        /// <summary>
        /// Convert a string (e.g., a project name), into one friendly to use in a path.
        /// Uses alphanumeric and '-' '_' ',' '(' ')'.
        /// Returns converted string, unless length 0, then returns fallback.
        /// </summary>
        public static string MakeFriendlyForPath(string name, string fallback = "")
        {
            // Method modified from https://stackoverflow.com/a/780800
            var normalizedName = name.Normalize(NormalizationForm.FormD);
            var stringBuilder = new StringBuilder();

            foreach (var c in normalizedName)
            {
                switch (char.GetUnicodeCategory(c))
                {
                    case UnicodeCategory.LowercaseLetter:
                    case UnicodeCategory.UppercaseLetter:
                    case UnicodeCategory.DecimalDigitNumber:
                        stringBuilder.Append(c);
                        break;
                    case UnicodeCategory.DashPunctuation:
                    case UnicodeCategory.CurrencySymbol:
                    case UnicodeCategory.MathSymbol:
                    case UnicodeCategory.OtherLetter:
                    case UnicodeCategory.OtherSymbol:
                        stringBuilder.Append('-');
                        break;
                    case UnicodeCategory.ConnectorPunctuation:
                    case UnicodeCategory.LineSeparator:
                    case UnicodeCategory.ParagraphSeparator:
                    case UnicodeCategory.SpaceSeparator:
                        stringBuilder.Append('_');
                        break;
                    case UnicodeCategory.OpenPunctuation:
                    case UnicodeCategory.InitialQuotePunctuation:
                        stringBuilder.Append('(');
                        break;
                    case UnicodeCategory.ClosePunctuation:
                    case UnicodeCategory.FinalQuotePunctuation:
                        stringBuilder.Append(')');
                        break;
                    case UnicodeCategory.OtherPunctuation:
                        stringBuilder.Append(',');
                        break;
                }
            }

            var safeString = stringBuilder.ToString();
            if (safeString.Length > 0)
            {
                return safeString;
            }
            return fallback;
        }
    }
}
