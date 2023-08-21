import { Project } from "api";
import { Hash } from "types/hash";

const fontDir = "/fonts";
const fallbackFilePath = `${fontDir}/fallback.json`;

async function fetchText(pathOrUrl: string): Promise<string> {
  return await (await (await fetch(pathOrUrl)).blob()).text();
}

async function fetchCss(
  font: string,
  source: string
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
  return await fetchText(cssUrl);
}

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
    .map((f) => fallback[f])
    .map(async (f) => await fetchCss(f, source));
  return (await Promise.all(cssPromises)).filter((css): css is string => !!css);
}

async function getCss(fonts: string[]) {
  const cssDict: Hash<string> = {};
  const cssPromises = fonts.map(async (f) => {
    cssDict[f] = (await fetchCss(f, "local")) ?? "";
  });
  await Promise.all(cssPromises);

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
  cssStrings.push(...(await getFallbacks(needFallback)));
  return cssStrings;
}

export async function getProjCss(proj: Project) {
  const fonts = proj.analysisWritingSystems.map((ws) => ws.font);
  fonts.push(proj.vernacularWritingSystem.font);
  const filtered = [...new Set(fonts.filter((f) => f))];
  return await getCss(filtered);
}
