import { Bcp47Code } from "types/writingSystem";
import DictionaryLoader from "utilities/dictionaryLoader";

jest.mock("resources/dictionaries", () => ({
  getDict: (...args: any[]) => mockGetDict(...args),
  getKeys: (...args: any[]) => mockGetKeys(...args),
}));

const mockGetDict = jest.fn();
const mockGetKeys = jest.fn();

const bcp47 = Bcp47Code.Es;

describe("DictionaryLoader", () => {
  describe("constructor", () => {
    it(" ets lang and gets keys", () => {
      const loader = new DictionaryLoader(bcp47);
      expect(loader.lang === bcp47);
      expect(mockGetKeys).toHaveBeenCalledTimes(1);
      expect(mockGetKeys).toBeCalledWith(bcp47);
    });
  });

  describe("getKey", () => {
    it("gets the right key", () => {
      // Unicode values for a, b, c: 97, 98, 99
      mockGetKeys.mockReturnValueOnce(["97", "97-98", "97-98-99"]);
      const loader = new DictionaryLoader(bcp47);
      expect(loader.getKey("")).toEqual("");
      expect(loader.getKey("what?")).toEqual("");
      expect(loader.getKey("AVAST!")).toEqual("97");
      // "á" decomposes into 2 characters
      expect(loader.getKey("ábc")).toEqual("97");
      expect(loader.getKey("About")).toEqual("97-98");
      expect(loader.getKey("aBCDeF")).toEqual("97-98-99");
      expect(loader.getKey("abçedilla")).toEqual("97-98-99");
    });
  });

  describe("loadDictPart", () => {
    // Mock 2-word dictionary, 1 in the default part and 1 in a keyed part
    const mockWord0 = "foo";
    const mockWord1 = "bar";
    const mockKey1 = mockWord1.charCodeAt(0).toString();
    const mockDict = (
      _lang: Bcp47Code,
      key?: string
    ): Promise<string | undefined> =>
      Promise.resolve(
        key === mockKey1 ? mockWord1 : key ? undefined : `1\n${mockWord0}`
      );

    beforeEach(() => {
      mockGetDict.mockImplementation(mockDict);
      mockGetKeys.mockReturnValue([mockKey1]);
    });

    it("loads nothing for empty or non-existent key", async () => {
      const loader = new DictionaryLoader(bcp47);
      expect(await loader.loadDictPart("")).toBeUndefined;
      expect(await loader.loadDictPart("not-a-key")).toBeUndefined;
    });

    it("doesn't load the same part more than once", async () => {
      const loader = new DictionaryLoader(bcp47);
      expect(await loader.loadDictPart(mockWord1)).toBeTruthy();
      expect(await loader.loadDictPart(mockWord1)).toBeFalsy();
    });
  });
});
