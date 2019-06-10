import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import configureMockStore from "redux-mock-store";
import { State } from "../../types/word";
import { Word } from "../../types/word";
import { defaultState } from "../GoalView/TempDefaultState";
import { Provider } from "react-redux";
import { ParentWord } from "../../goals/MergeDupGoal/MergeDupStep/component";

const createMockStore = configureMockStore([]);

it("renders without crashing", () => {
  const mockStore = createMockStore({
    goalsState: {
      historyState: {
        history: defaultState.historyState.history
      },
      goalOptions: defaultState.goalOptions,
      suggestionsState: {
        suggestions: defaultState.suggestionsState.suggestions
      }
    },
    draggedWord: {
      draggedWord: {
        id: "0",
        vernacular: "",
        gloss: "",
        audioFile: "",
        created: "",
        modified: "",
        history: [],
        partOfSpeech: "",
        editedBy: [],
        accessability: State.active,
        otherField: ""
      }
    },
    mergeDupStepProps: {
      parentWords: [
        {
          id: "1",
          senses: [
            {
              id: "2",
              dups: [
                {
                  id: "3",
                  vernacular: "",
                  gloss: "",
                  audioFile: "",
                  created: "",
                  modified: "",
                  history: [],
                  partOfSpeech: "",
                  editedBy: [],
                  accessability: State.active,
                  otherField: ""
                }
              ]
            }
          ]
        }
      ],
      addParent: (word: Word) => word,
      dropWord: () => null,
      clearMerges: () => null,
      draggedWord: {
        id: "4",
        vernacular: "",
        gloss: "",
        audioFile: "",
        created: "",
        modified: "",
        history: [],
        partOfSpeech: "",
        editedBy: [],
        accessability: State.active,
        otherField: ""
      }
    }
  });

  const div = document.createElement("div");
  ReactDOM.render(
    <Provider store={mockStore}>
      <App />
    </Provider>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
