import { Dispatch } from "react";
import * as backend from "../../../../../backend";
import {
  getAllCharacters,
  fetchWords,
} from "../../../CharacterInventoryActions";

export function findAndReplace(findValue: string, replaceValue: string) {
  return async (dispatch: Dispatch<any>) => {
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
      console.log(err);
    }
  };
}
