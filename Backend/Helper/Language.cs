using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using BackendFramework.Models;
using SIL.WritingSystems;

namespace BackendFramework.Helper
{
    public static class Language
    {
        /// <summary>
        /// Extract list of distinct Language strings from all of a <see cref="Sense"/>'s Definitions and Glosses.
        /// </summary>
        public static List<string> GetSenseAnalysisLangTags(Sense sense)
        {
            var tags = sense.Definitions.Select(d => d.Language).ToList();
            tags.AddRange(sense.Glosses.Select(g => g.Language));
            return tags.Distinct().ToList();
        }

        /// <summary> Convert language tags into writing systems. </summary>
        public static List<WritingSystem> ConvertLangTagsToWritingSystems(IEnumerable<string> langTags)
        {
            // If Sldr isn't initialized, temporarily initialize it here.
            var isSldrInitialized = Sldr.IsInitialized;
            if (!isSldrInitialized)
            {
                Sldr.Initialize();
            }
            var langLookup = new LanguageLookup();
            var writingSystems = langTags.Where(tag => !string.IsNullOrEmpty(tag)).Select(tag =>
                new WritingSystem(tag, langLookup.GetLanguageFromCode(tag)?.DesiredName ?? ""));
            if (!isSldrInitialized)
            {
                Sldr.Cleanup();
            }
            return writingSystems.ToList();
        }

        /// <summary>
        /// Extract <see cref="WritingSystem"/>s from .ldml files in a directory or its WritingSystems subdirectory.
        /// </summary>
        public static List<WritingSystem> GetWritingSystems(string dirPath)
        {
            if (Directory.GetFiles(dirPath, "*.ldml").Length == 0)
            {
                dirPath = FileStorage.GenerateWritingsSystemsSubdirPath(dirPath);
            }

            var wsr = LdmlInFolderWritingSystemRepository.Initialize(dirPath);
            var ws = wsr.AllWritingSystems.Select(wsd => new WritingSystem(wsd)).ToList();
            ws.Sort(CompareWritingSystems);
            return ws;
        }

        /// <summary> A comparison function for sorting a List of writing systems. </summary>
        public static int CompareWritingSystems(WritingSystem x, WritingSystem y)
        {
            var xTag = x.Bcp47;
            var yTag = y.Bcp47;
            var xSubtag = xTag.Split("-").First();
            var ySubtag = yTag.Split("-").First();
            if (xSubtag.Length != ySubtag.Length)
            {
                // 3-letter language tags should sort before 2-letter ones.
                return ySubtag.Length - xSubtag.Length;
            }
            if (x.Name != y.Name)
            {
                // Named writing systems should sort before nameless ones.
                if (string.IsNullOrEmpty(x.Name))
                {
                    return 1;
                }
                if (string.IsNullOrEmpty(y.Name))
                {
                    return -1;
                }

                // Primarily sort by writing system Name.
                return String.Compare(x.Name, y.Name, StringComparison.OrdinalIgnoreCase);
            }

            // Secondarily sort by writing system BCP47 tag.
            return String.Compare(xTag, yTag, StringComparison.OrdinalIgnoreCase);
        }
    }
}
