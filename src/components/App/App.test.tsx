import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import configureMockStore from "redux-mock-store";
import { simpleWord } from "../../types/word";
import { Word } from "../../types/word";
import { defaultState } from "../GoalView/TempDefaultState";
import { Provider } from "react-redux";

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
      draggedWord: simpleWord("Ye", "You")
    },
    mergeDupStepProps: {
      parentWords: [
        {
          id: 1,
          senses: [
            {
              id: 2,
              dups: [simpleWord("Thee", "You"), simpleWord("Yes", "No")]
            }
          ]
        }
      ],
      addParent: (word: Word) => word,
      dropWord: () => null,
      clearMerges: () => null,
      draggedWord: simpleWord("Thou", "You")
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
