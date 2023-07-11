import { Bcp47Code } from "types/writingSystem";

// Dictionary files source (MPLv2):
// https://cgit.freedesktop.org/libreoffice/dictionaries

export default async function (bcp47: Bcp47Code) {
  // The cases should match the languages in src/resources/dictionaries/.
  // Explicitly name each resource file to prevent exclusion in webpack tree shaking.
  switch (bcp47) {
    case Bcp47Code.Ar:
      return {
        aff: (await import("resources/dictionaries/ar.aff")).default,
        dic: (await import("resources/dictionaries/ar.dic")).default,
      };
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
    case Bcp47Code.Pt:
      return {
        aff: (await import("resources/dictionaries/pt.aff")).default,
        dic: (await import("resources/dictionaries/pt.dic")).default,
      };
    case Bcp47Code.Ru:
      return {
        aff: (await import("resources/dictionaries/ru.aff")).default,
        dic: (await import("resources/dictionaries/ru.dic")).default,
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

/*export default async function (bcp47: Bcp47Code) {
  const load = async (fileName: string) =>
    (await import(`resources/dictionaries/${fileName}`)).default;
  return {
    aff: await load(`${bcp47}.aff`),
    dic: await load(`${bcp47}.dic`),
  };
}*/
