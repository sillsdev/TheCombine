using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

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
            var dir = FileStorage.GenerateFontDirPath(fontId);
            if (!Directory.Exists(dir))
            {
                Directory.CreateDirectory(dir);
            }

            var family = "Noto Serif Tangut";
            var variant = Variant.Regular;
            var filePath = Path.Combine(dir, "NotoSerifTangut-Regular.ttf");
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

            var path = "%PUBLIC_URL%/NotoSerifTangut-Regular.ttf";
            return new List<string> { GenerateFontCss(family, variant, path, format) };
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
