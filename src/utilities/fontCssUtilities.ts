import { type Project } from "api/models";
import { type Hash } from "types/hash";
import { RuntimeConfig } from "types/runtimeConfig";

const fontDir = "/fonts";
const fallbackFilePath = `${fontDir}/fallback.json`;

/** Given a url, returns the text content of the result, or undefined if fetch fails. */
async function fetchText(url: string): Promise<string | undefined> {
  const resp = await fetch(url);
  if (resp.ok) {
    return await (await resp.blob()).text();
  }

  if (RuntimeConfig.getInstance().isOffline()) {
    // In an offline setting, all necessary fonts should be pre-loaded.
    console.log(
      `Failed to load file: ${url}\nPlease notify the admin this font is unavailable.`
    );
  } else {
    console.log(
      `Checked if this file exists: ${url}\nIt does not and that is probably okay.`
    );
  }
}

/** Given a font and source, returns css info for the font from the source.
 * If substitute is specified, sub that in as the "font-family". */
export async function fetchCss(
  font: string,
  source: string,
  substitute?: string
): Promise<string | undefined> {
  let cssUrl = "";
  switch (source) {
    case "local":
      cssUrl = `${fontDir}/${font.replaceAll(" ", "")}.css`;
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
    console.warn(`Failed to load: ${fallbackFilePath}`);
    return [];
  }
  const fallbackJson: Hash<Hash<string>> = JSON.parse(fallbackText);
  if (!(source in fallbackJson) || !fallbackJson[source]) {
    console.warn(`Source "${source}" not in file: ${fallbackFilePath}`);
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
export async function getCss(fonts: string[]): Promise<string[]> {
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
  // If no internet expected, don't execute this line with getFallbacks().
  if (!RuntimeConfig.getInstance().isOffline()) {
    cssStrings.push(...(await getFallbacks(needFallback)));
  }
  return cssStrings;
}

/** Given a project, returns css info for all project language fonts. */
export async function getProjCss(proj: Project): Promise<string[]> {
  const fonts = proj.analysisWritingSystems.map((ws) => ws.font);
  fonts.push(proj.vernacularWritingSystem.font);
  const filtered = [...new Set(fonts.filter((f) => f))];
  return await getCss(filtered);
}
