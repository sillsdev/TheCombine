import arDic from "resources/dictionaries/ar";
import enDic from "resources/dictionaries/en";
import esDic from "resources/dictionaries/es";
import frDic from "resources/dictionaries/fr";
import hiDic from "resources/dictionaries/hi";
import ptDic from "resources/dictionaries/pt";
import ruDic from "resources/dictionaries/ru";
import swDic from "resources/dictionaries/sw";
import { Bcp47Code } from "types/writingSystem";

// Dictionary files source (MPLv2):
// https://cgit.freedesktop.org/libreoffice/dictionaries

export default async function (
  bcp47: Bcp47Code,
  letter?: string,
  exclude?: string[]
) {
  // The cases should match the languages in src/resources/dictionaries/.
  // Explicitly name each resource file to prevent exclusion in webpack tree shaking.
  switch (bcp47) {
    case Bcp47Code.Ar:
      return {
        aff: letter
          ? ""
          : (await import("resources/dictionaries/ar.aff")).default,
        dic: await arDic(letter, exclude),
      };
    case Bcp47Code.En:
      return {
        aff: letter
          ? ""
          : (await import("resources/dictionaries/en.aff")).default,
        dic: await enDic(letter, exclude),
      };
    case Bcp47Code.Es:
      return {
        aff: letter
          ? ""
          : (await import("resources/dictionaries/es.aff")).default,
        dic: await esDic(letter, exclude),
      };
    case Bcp47Code.Fr:
      return {
        aff: letter
          ? ""
          : (await import("resources/dictionaries/fr.aff")).default,
        dic: await frDic(letter, exclude),
      };
    case Bcp47Code.Hi:
      return {
        aff: letter
          ? ""
          : (await import("resources/dictionaries/hi.aff")).default,
        dic: await hiDic(letter, exclude),
      };
    case Bcp47Code.Pt:
      return {
        aff: letter
          ? ""
          : (await import("resources/dictionaries/pt.aff")).default,
        dic: await ptDic(letter, exclude),
      };
    case Bcp47Code.Ru:
      return {
        aff: letter
          ? ""
          : (await import("resources/dictionaries/ru.aff")).default,
        dic: await ruDic(letter, exclude),
      };
    case Bcp47Code.Sw:
      return {
        aff: letter
          ? ""
          : (await import("resources/dictionaries/sw.aff")).default,
        dic: await swDic(letter, exclude),
      };
    default:
      return;
  }
}
