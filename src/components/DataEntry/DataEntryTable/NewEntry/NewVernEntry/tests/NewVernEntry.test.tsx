import React from "react";
import ReactDOM from "react-dom";
import LocalizedNewVernEntry from "../NewVernEntry";
import { simpleWord } from "../../../../../../types/word";

describe("Tests NewVernEntry", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <LocalizedNewVernEntry
        vernacular={""}
        vernInput={React.createRef<HTMLDivElement>()}
        updateVernField={() => null}
        newEntry={simpleWord("", "")}
        allWords={[]}
        updateNewEntry={() => null}
      />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
