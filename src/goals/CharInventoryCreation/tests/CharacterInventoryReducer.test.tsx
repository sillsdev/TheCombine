import axios from "axios";
import {
  characterInventoryReducer,
  defaultState,
  CharacterInventoryState
} from "../CharacterInventoryReducer";
import {
  CharacterInventoryAction,
  SET_ACCEPTED_CHARACTERS
} from "../CharacterInventoryActions";

const DATA: string[] = ["foo", "bar"];
const BAD_RESP: string[] = ["If", "this", "appears", "there's", "an", "issue"];

describe("Test Character Inventory Reducer", () => {
  it("Returns default state when passed no state", () => {
    expect(
      characterInventoryReducer(undefined, {
        type: "" as SET_ACCEPTED_CHARACTERS,
        payload: BAD_RESP
      } as CharacterInventoryAction)
    ).toEqual(defaultState);
  });

  it("Returns a state with a specified inventory when passed an inventory", () => {
    expect(
      characterInventoryReducer(undefined, {
        type: SET_ACCEPTED_CHARACTERS,
        payload: DATA
      } as CharacterInventoryAction)
    ).toEqual({ inventory: DATA });
  });

  it("Returns state passed in when passed an undefined action", () => {
    let inv = { inventory: DATA };
    expect(
      characterInventoryReducer(inv, {
        type: "" as SET_ACCEPTED_CHARACTERS,
        payload: BAD_RESP
      } as CharacterInventoryAction)
    ).toEqual(inv);
  });
});
