﻿using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Globalization;
using System.Linq;
using System.Text;

namespace BackendFramework.Helper
{
    /// <summary> Indicates an invalid input file name. </summary>
    public sealed class InvalidFileNameException : Exception
    {
        public InvalidFileNameException() : base() { }
    }

    /// <summary> Indicates an invalid input id. </summary>
    public sealed class InvalidIdException : Exception
    {
        public InvalidIdException() { }
    }

    public static class Sanitization
    {
        /// <summary>
        /// Validate that an ID field sent from a user does not contain any illegal characters.
        /// This is especially important if, for example, user input ultimately is used in the creation of a path to
        /// disk.
        /// </summary>
        /// <returns> The input string, if it is already sanitized. </returns>
        /// <exception cref="InvalidIdException"> Throws with string isn't sanitized. </exception>
        public static string SanitizeId(string id)
        {
            if (id.All(c => char.IsLetterOrDigit(c) || c == '-'))
            {
                return id;
            }
            throw new InvalidIdException();
        }

        /// <summary>
        /// Validate that a file name does not have any illegal characters (such as / or \) which could manipulate
        /// the path of files that are stored or retrieved.
        /// </summary>
        /// <returns> The input string, if it is already sanitized. </returns>
        /// <exception cref="InvalidFileNameException"> Throws when string isn't sanitized. </exception>
        public static string SanitizeFileName(string fileName)
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
            if (fileName.All(c => char.IsLetterOrDigit(c) || validCharacters.Contains(c)))
            {
                return fileName;
            }
            throw new InvalidFileNameException();
        }

        /// <summary>
        /// Convert a string (e.g., a project name), into one friendly to use in a path.
        /// Uses international alphanumeric and '-' '_' ',' '(' ')'.
        /// </summary>
        /// <returns> Converted string, unless length 0, then returns fallback. </returns>
        public static string MakeFriendlyForPath(string name, string fallback = "")
        {
            // Method modified from https://stackoverflow.com/a/780800
            var normalizedName = name.Normalize(NormalizationForm.FormD);
            var stringBuilder = new StringBuilder(capacity: normalizedName.Length);

            foreach (var c in normalizedName)
            {
                switch (char.GetUnicodeCategory(c))
                {
                    case UnicodeCategory.LowercaseLetter:
                    case UnicodeCategory.UppercaseLetter:
                    case UnicodeCategory.OtherLetter:
                    case UnicodeCategory.DecimalDigitNumber:
                        stringBuilder.Append(c);
                        break;
                    case UnicodeCategory.DashPunctuation:
                    case UnicodeCategory.CurrencySymbol:
                    case UnicodeCategory.MathSymbol:
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
