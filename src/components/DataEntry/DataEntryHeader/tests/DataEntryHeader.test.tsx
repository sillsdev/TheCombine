import React from "react";
import { Provider } from "react-redux";
import DataEntryHeader from "../DataEntryHeader";
import configureMockStore from "redux-mock-store";
import renderer, {
  ReactTestRenderer,
  ReactTestInstance,
} from "react-test-renderer";
import { baseDomain } from "../../../../types/SemanticDomain";
import { Switch } from "@material-ui/core";
const createMockStore = configureMockStore([]);
const mockStore = createMockStore({});

let testRenderer: ReactTestRenderer;

beforeEach(() => {
  renderer.act(() => {
    testRenderer = renderer.create(
      <Provider store={mockStore}>
        <DataEntryHeader
          domain={baseDomain}
          questionsVisible={false}
          setQuestionVisibility={() => {}}
        />
      </Provider>
    );
  });
});

describe("Tests DataEntryHeader", () => {
  it("No questions should disable switch and show no questions", () => {
    const mockCallback = jest.fn();

    const instance = renderer.create(
      <Provider store={mockStore}>
        <DataEntryHeader
          domain={baseDomain}
          questionsVisible={true}
          setQuestionVisibility={mockCallback}
        />
      </Provider>
    ).root;

    //assert disabled switch and no questions shown
  });

  it("Questions Visible should show questions", () => {
    const newDomain = { ...baseDomain, questions: ["Q1"] };
    const mockCallback = jest.fn();

    const instance = renderer.create(
      <Provider store={mockStore}>
        <DataEntryHeader
          domain={newDomain}
          questionsVisible={true}
          setQuestionVisibility={mockCallback}
        />
      </Provider>
    ).root;

    //assert questions are visible
  });

  it("Questions not visible should hide questions", () => {
    const newDomain = { ...baseDomain, questions: ["Q1", "Q2"] };
    const mockCallback = jest.fn();

    const instance = renderer.create(
      <Provider store={mockStore}>
        <DataEntryHeader
          domain={newDomain}
          questionsVisible={false}
          setQuestionVisibility={mockCallback}
        />
      </Provider>
    ).root;

    //assert questions are hidden
  });

  it("Callback should be called on switch click", () => {
    const newDomain = { ...baseDomain, questions: ["Q1", "Q2"] };
    const mockCallback = jest.fn();

    const instance = renderer.create(
      <Provider store={mockStore}>
        <DataEntryHeader
          domain={newDomain}
          questionsVisible={false}
          setQuestionVisibility={mockCallback}
        />
      </Provider>
    ).root;

    const swInMethod = instance.findByProps({
      id: "questionVisibilitySwitch",
    });
    swInMethod.props.onChange();
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });
});
