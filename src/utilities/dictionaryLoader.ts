import { getKeyDic } from "resources/dictionaries";
import { Bcp47Code } from "types/writingSystem";

export default class DictionaryLoader {
  private readonly loaded: string[] = [];
  readonly lang: Bcp47Code;

  constructor(bcp47: Bcp47Code) {
    this.lang = bcp47;
  }

  async loadDictionary(): Promise<string | undefined> {
    const [_, dic] = await getKeyDic(this.lang);
    return dic;
  }

  async loadDictPart(start: string): Promise<string | undefined> {
    if (!start) {
      return;
    }
    start = start.toLocaleLowerCase();
    const [exc, dic] = await getKeyDic(this.lang, start, this.loaded);
    if (exc && !this.loaded.includes(exc)) {
      this.loaded.push(exc);
    }
    return dic;
  }
}
