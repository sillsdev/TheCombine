import { getDict, getKeys } from "resources/dictionaries";
import { Hash } from "types/hash";
import { Bcp47Code } from "types/writingSystem";

export default class DictionaryLoader {
  private readonly loaded: Hash<boolean> = {};
  readonly lang: Bcp47Code;
  private readonly keys: string[] | undefined;

  constructor(bcp47: Bcp47Code) {
    this.lang = bcp47;
    this.keys = getKeys(bcp47);
  }

  /**
   * Input string `word` is a (partial) word typed by a user.
   *
   * Output string `key` is the key for the dictionary part
   *   that contains or would contain the word;
   *   the key is "-"-joined unicode numbers (e.g., "101-109" for "em").
   *
   * For example:
   *   the `es` dictionary has 4 parts for words beginning with "e":
   *   those beginning with "em", "en", "es", and "e" (everything else);
   *   with input word "Emp" then the key for the "em"-part would be returned;
   *   with input word "extra" the key for the "e"-part would be returned.
   */
  getKey(word: string): string {
    if (!word || !this.keys) {
      return "";
    }
    const charCodes = word
      .normalize("NFD") // match the default --normalize argument of split_dictionary.py
      .toLocaleLowerCase()
      .split("")
      .map((c) => c.charCodeAt(0));
    let key = "";
    while (true) {
      key = charCodes.join("-");
      if (!key || this.keys.includes(key)) {
        return key;
      }
      charCodes.pop();
    }
  }

  async loadDictionary(): Promise<string | undefined> {
    return await getDict(this.lang);
  }

  async loadDictPart(word: string): Promise<string | undefined> {
    const key = this.getKey(word);
    if (!key || key in this.loaded) {
      return;
    }
    this.loaded[key] = true;
    if (process.env.NODE_ENV === "development") {
      console.log(`Loading dictionary part ${key} (with: "${word}")`);
    }
    const dic = await getDict(this.lang, key);
    if (!dic) {
      console.error(`Failed to load dictionary part ${key} (with: "${word}")`);
      delete this.loaded[key];
    }
    return dic;
  }
}
