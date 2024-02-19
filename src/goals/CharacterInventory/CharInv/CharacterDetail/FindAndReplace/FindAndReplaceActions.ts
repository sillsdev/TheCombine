import * as backend from "backend";
import {
  addWordChanges,
  fetchWords,
  getAllCharacters,
} from "goals/CharacterInventory/Redux/CharacterInventoryActions";
import { StoreStateDispatch } from "types/Redux/actions";
import { Hash } from "types/hash";

export function findAndReplace(findValue: string, replaceValue: string) {
  return async (dispatch: StoreStateDispatch) => {
    const changedWords = (await backend.getFrontierWords()).filter((w) =>
      w.vernacular.includes(findValue)
    );
    if (changedWords.length) {
      const findRegExp = new RegExp(
        findValue.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&"),
        "g"
      );
      const wordChanges: Hash<string> = {};
      for (const word of changedWords) {
        word.vernacular = word.vernacular.replace(findRegExp, replaceValue);
        wordChanges[word.id] = (await backend.updateWord(word)).id;
      }
      await dispatch(addWordChanges(wordChanges));
      await dispatch(fetchWords());
      await dispatch(getAllCharacters());
    }
  };
}
