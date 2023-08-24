import { Project } from "api";
import { Hash } from "types/hash";

const fontDir = "/fonts";
const fallbackFilePath = `${fontDir}/fallback.json`;

/** Given a url, returns the text content of the result, or undefined if fetch fails. */
async function fetchText(url: string): Promise<string | undefined> {
  let text: string | undefined;
  try {
    // TODO: This `try`/`catch` isn't enough to prevent 404 errors outside development.
    text = await (await (await fetch(url)).blob()).text();
  } catch {
    if (process.env.NODE_ENV === "development") {
      console.log(`Failed to fetch ${url}`);
    }
  }
  return text;
}

/** Given a font and source, returns css info for the font from the source.
 * If substitute is specified, sub that in as the "font-family". */
async function fetchCss(
  font: string,
  source: string,
  substitute?: string
): Promise<string | undefined> {
  var cssUrl = "";
  switch (source) {
    case "local":
      cssUrl = `${fontDir}/${font.replace(" ", "")}.css`;
      break;
    case "google":
      cssUrl = `https://fonts.googleapis.com/css?dispay=swap&family=${font}`;
      break;
    default:
      return;
  }

  const cssText = await fetchText(cssUrl);
  if (cssText && substitute) {
    // This assumes the only place in the css info with the full, capitalized font name
    // is the "font-family: ..." (as is the case from the Google api).
    return cssText.replaceAll(font, substitute);
  }
  return cssText;
}

/** Given a list of fonts with no local css files,
 * returns css info from a remote source (default: google). */
async function getFallbacks(
  fonts: string[],
  source = "google"
): Promise<string[]> {
  if (!fonts.length) {
    return [];
  }
  const fallbackText = await fetchText(fallbackFilePath);
  if (!fallbackText || fallbackText[0] !== "{") {
    return [];
  }
  const fallbackJson: Hash<Hash<string>> = JSON.parse(fallbackText);
  if (!(source in fallbackJson) || !fallbackJson[source]) {
    return [];
  }
  const fallback = fallbackJson[source];
  const cssPromises = fonts
    .filter((f) => f in fallback)
    .map((f) => [f, fallback[f]])
    .map(async (fs) => await fetchCss(fs[1], source, fs[0]));
  return (await Promise.all(cssPromises)).filter((css): css is string => !!css);
}

/** Given an array of font names, returns css info for them all. */
async function getCss(fonts: string[]) {
  // Get local css files when available.
  const cssDict: Hash<string> = {};
  const cssPromises = fonts.map(async (f) => {
    cssDict[f] = (await fetchCss(f, "local")) ?? "";
  });
  await Promise.all(cssPromises);

  // Get remote fallbacks for the rest.
  const cssStrings: string[] = [];
  const needFallback: string[] = [];
  fonts.forEach((f) => {
    const css = cssDict[f];
    if (css && css[0] === "@") {
      cssStrings.push(css);
    } else {
      needFallback.push(f);
    }
  });
  // TODO: If on NUC, don't execute this line with getFallbacks().
  cssStrings.push(...(await getFallbacks(needFallback)));

  return cssStrings;
}

/** Given a project, returns css info for all project language fonts. */
export async function getProjCss(proj: Project) {
  const fonts = proj.analysisWritingSystems.map((ws) => ws.font);
  fonts.push(proj.vernacularWritingSystem.font);
  const filtered = [...new Set(fonts.filter((f) => f))];
  return await getCss(filtered);
}
