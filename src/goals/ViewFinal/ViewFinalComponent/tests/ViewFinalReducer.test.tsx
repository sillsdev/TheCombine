import { viewFinalReducer, defaultState } from "../ViewFinalReducer";
import { OLD_SENSE } from "../ViewFinalComponent";
import { ViewFinalActionTypes } from "../ViewFinalActions";
import mockWords from "./MockWords";

const newWord = {
  id: mockWords[0].id,
  vernacular: "toadTOAD",
  senses: [
    {
      senseId: "1",
      glosses: "bupBUP",
      domains: [
        { name: "domain", id: "number" },
        { name: "domain2", id: "number2" }
      ],
      deleted: false
    }
  ]
};
const result = {
  id: "a new mock id",
  vernacular: "toadTOAD",
  senses: [
    {
      senseId: "1" + OLD_SENSE,
      glosses: "bupBUP",
      domains: [
        { name: "domain", id: "number" },
        { name: "domain2", id: "number2" }
      ],
      deleted: false
    }
  ]
};
const mockState = {
  ...defaultState,
  words: mockWords
};

describe("Test ViewFinalReducer", () => {
  it("Returns default state when passed undefined state", () => {
    expect(viewFinalReducer(undefined, { type: undefined } as any)).toEqual(
      defaultState
    );
  });

  it("Adds a set of words to a list when passed an UpdateAllWords action", () => {
    expect(
      viewFinalReducer(defaultState, {
        type: ViewFinalActionTypes.UpdateAllWords,
        words: mockWords
      })
    ).toEqual(mockState);
  });

  it("Updates a specified word when passed an UpdateWord action", () => {
    expect(
      viewFinalReducer(mockState, {
        type: ViewFinalActionTypes.UpdateWord,
        id: mockWords[0].id,
        newId: result.id,
        newWord: newWord
      })
    ).toEqual({ ...mockState, words: [result, mockWords[1]] });
  });
});
