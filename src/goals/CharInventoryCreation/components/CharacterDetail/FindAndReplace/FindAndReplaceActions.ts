import * as backend from "backend";
import { errorToast } from "components/Toast/SwalToast";
import {
  fetchWords,
  getAllCharacters,
} from "goals/CharInventoryCreation/Redux/CharacterInventoryActions";
import { StoreStateDispatch } from "types/Redux/actions";

export function findAndReplace(findValue: string, replaceValue: string) {
  return async (dispatch: StoreStateDispatch) => {
    try {
      const allWords = await backend.getFrontierWords();
      const changedWords = allWords.filter((word) =>
        word.vernacular.includes(findValue)
      );
      const findRegExp = new RegExp(
        findValue.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&"),
        "g"
      );
      for (const word of changedWords) {
        word.vernacular = word.vernacular.replace(findRegExp, replaceValue);
        await backend.updateWord(word);
      }
      await dispatch(fetchWords());
      await dispatch(getAllCharacters());
    } catch (err) {
      console.error(err);
      await errorToast.fire({
        title: "Find and Replace",
        text: `Error processing Find: ${findValue} Replace: ${replaceValue}`,
      });
    }
  };
}
