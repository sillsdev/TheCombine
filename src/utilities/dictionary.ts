import { Bcp47Code, dictionaryLangs } from "types/writingSystem";

// Dictionary files source (MPLv2):
// https://cgit.freedesktop.org/libreoffice/dictionaries
const dir = "resources/dictionaries/";

async function load(fileName: string): Promise<string> {
  return (await import(`${dir}${fileName}`)).default;
}

export default async function (bcp47: Bcp47Code) {
  if (!dictionaryLangs.includes(bcp47)) {
    return;
  }
  return {
    aff: await load(`${bcp47}.aff`),
    dic: await load(`${bcp47}.dic`),
  };
}
