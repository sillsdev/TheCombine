import {
  characterInventoryReducer,
  defaultState,
} from "goals/CharInventoryCreation/Redux/CharacterInventoryReducer";
import {
  CharacterInventoryState,
  CharacterInventoryAction,
  CharacterInventoryType,
} from "goals/CharInventoryCreation/Redux/CharacterInventoryReduxTypes";
import { StoreAction, StoreActionTypes } from "rootActions";

const DATA: string[] = ["a", "b"];
const BAD_RESP: string[] = ["If", "this", "appears", "there's", "an", "issue"];

describe("Test Character Inventory Reducer", () => {
  it("Returns default state when passed no state", () => {
    expect(
      characterInventoryReducer(undefined, {
        type: "" as CharacterInventoryType.SET_VALID_CHARACTERS,
        payload: BAD_RESP,
      } as CharacterInventoryAction)
    ).toEqual(defaultState);
  });

  it("Returns a state with a specified inventory when passed an inventory", () => {
    expect(
      characterInventoryReducer(undefined, {
        type: CharacterInventoryType.SET_VALID_CHARACTERS,
        payload: DATA,
      } as CharacterInventoryAction)
    ).toEqual({
      validCharacters: DATA,
      allWords: [],
      characterSet: [],
      rejectedCharacters: [],
      selectedCharacter: "",
    });
  });

  it("Returns state passed in when passed an undefined action", () => {
    let inv = {
      validCharacters: DATA,
      allWords: [],
      characterSet: [],
      rejectedCharacters: [],
      selectedCharacter: "",
    };
    expect(
      characterInventoryReducer(inv, {
        type: "" as CharacterInventoryType.SET_VALID_CHARACTERS,
        payload: BAD_RESP,
      } as CharacterInventoryAction)
    ).toEqual(inv);
  });

  it("Returns default state when passed reset action", () => {
    let action: StoreAction = {
      type: StoreActionTypes.RESET,
    };

    expect(
      characterInventoryReducer({} as CharacterInventoryState, action)
    ).toEqual(defaultState);
  });
});
