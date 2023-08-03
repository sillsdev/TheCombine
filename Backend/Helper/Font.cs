using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace BackendFramework.Helper
{
    /// <summary>
    /// Helper for fetching fonts and font css info to send to the frontend.
    /// </summary>
    public static class Font
    {
        private const string googleFontUrl = "https://fonts.googleapis.com/css?dispay=swap&family=";

        /// <summary>
        /// Given a list of fonts, fetch the deploy-generated css files.
        /// If offline (i.e., on a NUC), each css file contains the path of a font file loaded during deployment.
        /// Otherwise, the css files (including any fallbacks fetched from Google) have urls for the requested fonts.
        /// </summary>
        public static async Task<List<string>> GetFonts(List<string> fonts)
        {
            var sortedFonts = fonts.Select(f => f.Replace(" ", "")).Distinct().ToList();
            sortedFonts.Sort();

            var googleFallbackPath = FileStorage.GetGoogleFallbackFilePath();
            var googleFallback = new Dictionary<string, string>();

            HttpClient? client = null;
            // Todo: Add check for not-NUC here.
            if (File.Exists(googleFallbackPath))
            {
                client = new HttpClient();
                // Spoof a modern browser for Google to return fonts in woff2 and with broad Unicode support.
                client.DefaultRequestHeaders.Add("User-Agent", "Firefox/116.0");
                googleFallback = (await File.ReadAllLinesAsync(googleFallbackPath))
                    .Where(line => line.Contains(':'))
                    .Select(line => line.Split(':'))
                    .ToDictionary(pair => pair[0].Trim(), pair => pair[1].Trim());
            }

            var cssStrings = new List<string>();

            foreach (var font in sortedFonts)
            {
                var cssPath = FileStorage.GenerateFontCssFilePath(font);
                if (File.Exists(cssPath))
                {
                    cssStrings.Add(await File.ReadAllTextAsync(cssPath));
                    continue;
                }

                if (client is not null && googleFallback.TryGetValue(font, out var fallback))
                {
                    var url = $"{googleFontUrl}{fallback}";
                    try
                    {
                        var cssString = await client.GetStringAsync(url);
                        cssStrings.Add(cssString.Replace($"'{fallback}';", $"'{font}';"));
                    }
                    catch
                    {
                        // If the file download doesn't work, move on.
                    }
                }
            }

            return cssStrings;
        }
    }
}
