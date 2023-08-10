//import arDic from "resources/dictionaries/ar";
import enDic from "resources/dictionaries/en";
import esDic from "resources/dictionaries/es";
//import frDic from "resources/dictionaries/fr";
import hiDic from "resources/dictionaries/hi";
//import ptDic from "resources/dictionaries/pt";
//import ruDic from "resources/dictionaries/ru";
import swDic from "resources/dictionaries/sw";
import { Bcp47Code } from "types/writingSystem";

// Dictionary files source (MPLv2):
// https://cgit.freedesktop.org/libreoffice/dictionaries

export default async function (
  bcp47: Bcp47Code,
  start?: string,
  exclude?: string[]
) {
  let aff = "";
  let dic: string | undefined;
  let exc: string | undefined;
  // The cases should match the languages in src/resources/dictionaries/.
  // Explicitly name each resource file to prevent exclusion in webpack tree shaking.
  switch (bcp47) {
    /*case Bcp47Code.Ar:
      aff = start
        ? ""
        : (await import("resources/dictionaries/ar.aff")).default;
      [exc, dic] = await arDic(start, exclude) ?? [undefined,undefined];
      return {aff, dic, exc};
      };*/
    case Bcp47Code.En:
      aff = start
        ? ""
        : (await import("resources/dictionaries/en.aff")).default;
      [exc, dic] = (await enDic(start, exclude)) ?? [undefined, undefined];
      return { aff, dic, exc };
    case Bcp47Code.Es:
      aff = start
        ? ""
        : (await import("resources/dictionaries/es.aff")).default;
      [exc, dic] = (await esDic(start, exclude)) ?? [undefined, undefined];
      return { aff, dic, exc };
    /*case Bcp47Code.Fr:
      aff = start
        ? ""
        : (await import("resources/dictionaries/fr.aff")).default;
      [exc, dic] = (await frDic(start, exclude)) ?? [undefined, undefined];
      return { aff, dic, exc };*/
    case Bcp47Code.Hi:
      aff = start
        ? ""
        : (await import("resources/dictionaries/hi.aff")).default;
      [exc, dic] = (await hiDic(start, exclude)) ?? [undefined, undefined];
      return { aff, dic, exc };
    /*case Bcp47Code.Pt:
      aff = start
        ? ""
        : (await import("resources/dictionaries/pt.aff")).default;
      [exc, dic] = (await ptDic(start, exclude)) ?? [undefined, undefined];
      return { aff, dic, exc };*/
    /*case Bcp47Code.Ru:
      aff = start
        ? ""
        : (await import("resources/dictionaries/ru.aff")).default;
      [exc, dic] = (await ruDic(start, exclude)) ?? [undefined, undefined];
      return { aff, dic, exc };*/
    case Bcp47Code.Sw:
      aff = start
        ? ""
        : (await import("resources/dictionaries/sw.aff")).default;
      [exc, dic] = (await swDic(start, exclude)) ?? [undefined, undefined];
      return { aff, dic, exc };
    default:
      return { aff, dic, exc };
  }
}
