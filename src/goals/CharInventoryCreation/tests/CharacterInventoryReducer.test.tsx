import axios from "axios";
import {
  characterInventoryReducer,
  defaultState,
  CharacterInventoryState
} from "../CharacterInventoryReducer";
import {
  CharacterInventoryAction,
  SET_VALID_CHARACTERS
} from "../CharacterInventoryActions";
import { StoreActions, StoreAction } from "../../../rootActions";

const DATA: string[] = ["a", "b"];
const DATA2: string[] = ["c", "d"];
const BAD_RESP: string[] = ["If", "this", "appears", "there's", "an", "issue"];

describe("Test Character Inventory Reducer", () => {
  it("Returns default state when passed no state", () => {
    expect(
      characterInventoryReducer(undefined, {
        type: "" as SET_VALID_CHARACTERS,
        payload: BAD_RESP
      } as CharacterInventoryAction)
    ).toEqual(defaultState);
  });

  it("Returns a state with a specified inventory when passed an inventory", () => {
    expect(
      characterInventoryReducer(undefined, {
        type: SET_VALID_CHARACTERS,
        payload: DATA
      } as CharacterInventoryAction)
    ).toEqual({ validCharacters: DATA, rejectedCharacters: [] });
  });

  it("Returns state passed in when passed an undefined action", () => {
    let inv = { validCharacters: DATA, rejectedCharacters: [] };
    expect(
      characterInventoryReducer(inv, {
        type: "" as SET_VALID_CHARACTERS,
        payload: BAD_RESP
      } as CharacterInventoryAction)
    ).toEqual(inv);
  });

  it("Returns default state when passed reset action", () => {
    let action: StoreAction = {
      type: StoreActions.RESET
    };

    expect(
      characterInventoryReducer({} as CharacterInventoryState, action)
    ).toEqual(defaultState);
  });
});
