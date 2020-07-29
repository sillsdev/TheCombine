import React from "react";
import renderer from "react-test-renderer";

import { AutoComplete } from "../../../../../types/AutoComplete";
import { NewEntry } from "../NewEntry";

jest.mock("../../GlossWithSuggestions/GlossWithSuggestions");
jest.mock("../NewVernEntry/NewVernEntry");

describe("Tests NewEntry", () => {
  it("renders without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <NewEntry
          allWords={[]}
          updateWord={() => null}
          addNewWord={() => null}
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
