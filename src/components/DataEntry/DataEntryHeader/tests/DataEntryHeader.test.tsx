import React from "react";
import { Provider } from "react-redux";
import { DataEntryHeader, getQuestions } from "../DataEntryHeader";
import configureMockStore from "redux-mock-store";
import renderer, { ReactTestInstance } from "react-test-renderer";
import SemanticDomainWithSubdomains, {
  baseDomain,
} from "../../../../types/SemanticDomain";
const createMockStore = configureMockStore([]);
const mockStore = createMockStore({});

describe("Tests DataEntryHeader", () => {
  it("No questions should disable switch and show no questions", () => {
    const mockCallback = jest.fn();
    const instance = createDataEntryHeaderInstance(
      baseDomain,
      true,
      mockCallback
    );
    const questionSwitch = instance.findByProps({
      id: "questionVisibilitySwitch",
    });
    expect(questionSwitch.props.disabled).toBeTruthy();
    expect(getQuestions(true, [])).toEqual([]);
  });

  it("Questions Visible should show questions", () => {
    const newDomain = { ...baseDomain, questions: ["Q1", "Q2", "Q3"] };
    const mockCallback = jest.fn();

    const instance = createDataEntryHeaderInstance(
      newDomain,
      true,
      mockCallback
    );
    newDomain.questions.forEach((questionString, index) => {
      let question: ReactTestInstance = instance.findByProps({
        id: `q${index}`,
      });
      expect(question.props.children).toEqual(questionString);
    });
  });

  it("Questions not visible should hide questions", () => {
    expect(getQuestions(false, ["Q1", "Q2"])).toBeUndefined();
  });

  it("Callback should be called on switch click", () => {
    const newDomain = { ...baseDomain, questions: ["Q1", "Q2"] };
    const mockCallback = jest.fn();

    const instance: ReactTestInstance = createDataEntryHeaderInstance(
      newDomain,
      false,
      mockCallback
    );

    const questionSwitch: ReactTestInstance = instance.findByProps({
      id: "questionVisibilitySwitch",
    });
    questionSwitch.props.onChange();
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });
});

function createDataEntryHeaderInstance(
  dom: SemanticDomainWithSubdomains,
  qV: boolean,
  mCb: jest.Mock
): ReactTestInstance {
  return renderer.create(
    <Provider store={mockStore}>
      <DataEntryHeader
        domain={dom}
        questionsVisible={qV}
        setQuestionVisibility={mCb}
      />
    </Provider>
  ).root;
}
