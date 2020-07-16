import React from "react";
import renderer from "react-test-renderer";

import { AutoComplete } from "../../../../../types/AutoComplete";
import { Word } from "../../../../../types/word";
import { NewEntry } from "../NewEntry";

jest.mock("../../GlossEntry/GlossEntry");
jest.mock("../NewVernEntry/NewVernEntry");

describe("Tests NewEntry", () => {
  it("renders without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <NewEntry
          allWords={[]}
          updateWord={(updatedWord: Word) => null}
          addNewWord={(newWord: Word) => null}
          semanticDomain={{ name: "", id: "" }}
          displayDuplicates={false}
          autocompleteSetting={AutoComplete.OnRequest}
          toggleDisplayDuplicates={() => null}
          setIsReadyState={() => null}
        />
      );
    });
  });
});
