using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace BackendFramework.Helper
{
    public static class Font
    {
        public enum Variant
        {
            Bold,
            BoldItalic,
            Italic,
            Regular
        }

        /// <summary>
        /// ............
        /// </summary>
        public static async Task<List<string>> GetFonts(List<string> fonts)
        {
            var sortedFonts = fonts.Distinct<string>().ToList();
            sortedFonts.Sort();

            var fontId = "notoseriftangut";

            var family = "Noto Serif Tangut";
            var variant = Variant.Regular;
            var fileName = "NotoSerifTangut-Regular.ttf";
            var filePath = FileStorage.GenerateFontFilePath(fontId, fileName);
            var format = "ttf";
            //var mlpFamily = "Noto Sans Tangut";

            var src = "https://github.com/notofonts/notofonts.github.io/raw/main/fonts/NotoSerifTangut/googlefonts/ttf/NotoSerifTangut-Regular.ttf";
            if (!File.Exists(filePath))
            {

                using var client = new HttpClient();
                using var stream = await client.GetStreamAsync(src);
                using var fs = new FileStream(filePath, FileMode.OpenOrCreate);
                await stream.CopyToAsync(fs);
            }

            var rel_path = FileStorage.GenerateFontFilePath(fontId, fileName, true);
            return new List<string> { GenerateFontCss(family, variant, $"%BASE_PATH%/{rel_path}", format) };
        }

        private static Dictionary<string, FontFamilyInfo>? GetFontFamilyInfo()
        {
            const string fontFamiliesFile = "BackendFramework.Data.fontFamilies.json";
            var serializer = new JsonSerializer();
            var reader = new JsonTextReader(new StreamReader(fontFamiliesFile));
            return serializer.Deserialize<Dictionary<string, FontFamilyInfo>>(reader);
        }

        private class FontFamilyInfo
        {
            public Dictionary<string, string>? defaults { get; set; }
            public bool distributable { get; set; }
            public string? fallback { get; set; }
            public string? family { get; set; }
            public string? familyid { get; set; }
            public Dictionary<string, FontFileInfo>? files { get; set; }
            public string? license { get; set; }
            public string? packageurl { get; set; }
            public string? siteurl { get; set; }
            public string? status { get; set; }
            public string? version { get; set; }
            public string? ziproot { get; set; }
        }

        private class FontFileInfo
        {
            public Dictionary<string, int>? axes { get; set; }
            public string? flourl { get; set; }
            public string? packagepath { get; set; }
            public string? url { get; set; }
            public string? zippath { get; set; }
        }

        public static string GenerateFontCss(
            string family, Variant variant, string filePath, string format, string? mlpFamily = null)
        {
            var startLine = "@font-face {";
            var displayLine = "  font-display: swap;";
            var familyLine = $"  font-family: '{mlpFamily ?? family}';";
            var variantLines = variant switch
            {
                Variant.Bold => @"  font-style: normal;
  font-weight: bold;",
                Variant.BoldItalic => @"  font-style: italic;
  font-weight: bold;",
                Variant.Italic => @"  font-style: italic;
  font-weight: normal;",
                _ => @"  font-style: normal;
  font-weight: normal;"
            };
            var srcLocal = variant switch
            {
                Variant.Bold => $"local('{family} Bold'),",
                Variant.BoldItalic => $"local('{family} Bold Italic'),",
                Variant.Italic => $"local('{family} Italic'),",
                _ => $"local('{family}'), local('{family} Regular'),"
            };
            var srcLine = $"  src: url('{filePath}');";
            var endLine = "}";

            return $@"
{startLine}
{displayLine}
{familyLine}
{srcLine}
{endLine}
";
        }
    }
}
