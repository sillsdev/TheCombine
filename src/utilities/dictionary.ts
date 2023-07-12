import { Bcp47Code } from "types/writingSystem";

// Dictionary files source (MPLv2):
// https://cgit.freedesktop.org/libreoffice/dictionaries

export default async function (bcp47: Bcp47Code) {
  // The cases should match the languages in src/resources/dictionaries/.
  // Explicitly name each resource file to prevent exclusion in webpack tree shaking.
  switch (bcp47) {
    case Bcp47Code.En:
      return {
        aff: (await import("resources/dictionaries/en.aff")).default,
        dic: (await import("resources/dictionaries/en.dic")).default,
      };
    case Bcp47Code.Es:
      return {
        aff: (await import("resources/dictionaries/es.aff")).default,
        dic: (await import("resources/dictionaries/es.dic")).default,
      };
    case Bcp47Code.Fr:
      return {
        aff: (await import("resources/dictionaries/fr.aff")).default,
        dic: (await import("resources/dictionaries/fr.dic")).default,
      };
    case Bcp47Code.Hi:
      return {
        aff: (await import("resources/dictionaries/hi.aff")).default,
        dic: (await import("resources/dictionaries/hi.dic")).default,
      };
    case Bcp47Code.Sw:
      return {
        aff: (await import("resources/dictionaries/sw.aff")).default,
        dic: (await import("resources/dictionaries/sw.dic")).default,
      };
    default:
      return;
  }
}
