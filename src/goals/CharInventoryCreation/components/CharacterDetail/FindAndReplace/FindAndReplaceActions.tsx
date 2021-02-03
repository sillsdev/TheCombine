import * as backend from "backend";
import { StoreStateDispatch } from "types/actions";
import {
  fetchWords,
  getAllCharacters,
} from "goals/CharInventoryCreation/CharacterInventoryActions";

export function findAndReplace(findValue: string, replaceValue: string) {
  return async (dispatch: StoreStateDispatch) => {
    try {
      let allWords = await backend.getFrontierWords();
      let changedWords = allWords.filter((word) =>
        word.vernacular.includes(findValue)
      );
      let findRegExp = new RegExp(
        findValue.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&"),
        "g"
      );
      for (let word of changedWords) {
        word.vernacular = word.vernacular.replace(findRegExp, replaceValue);
        await backend.updateWord(word);
      }
      dispatch(fetchWords());
      dispatch(getAllCharacters());
    } catch (err) {
      console.error(err);
    }
  };
}
