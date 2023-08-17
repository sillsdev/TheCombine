import { getDic, getKeys } from "resources/dictionaries";
import { Hash } from "types/hash";
import { Bcp47Code } from "types/writingSystem";

export default class DictionaryLoader {
  private readonly loaded: Hash<boolean> = {};
  readonly lang: Bcp47Code;
  private readonly keys: string[];

  constructor(bcp47: Bcp47Code) {
    this.lang = bcp47;
    this.keys = getKeys(bcp47) ?? [];
  }

  private getKey(start: string): string {
    if (!start) {
      return "";
    }
    const startArray = start
      // "NFKD" to match the --normalize argument of split_dictionary.py
      .normalize("NFKD")
      .toLocaleLowerCase()
      .split("")
      .map((c) => c.toLocaleLowerCase().charCodeAt(0));
    var startCase = "";
    while (true) {
      startCase = startArray.join("-");
      if (!startCase || this.keys.includes(startCase)) {
        return startCase;
      }
      startArray.pop();
    }
  }

  async loadDictionary(): Promise<string | undefined> {
    return await getDic(this.lang);
  }

  async loadDictPart(start: string): Promise<string | undefined> {
    const key = this.getKey(start);
    if (!key || key in this.loaded) {
      return;
    }
    this.loaded[key] = true;
    const dic = await getDic(this.lang, key);
    if (!dic) {
      delete this.loaded[key];
      return;
    }
    return dic;
  }
}
