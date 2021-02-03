import React from "react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import renderer, { ReactTestInstance } from "react-test-renderer";

import DataEntryHeader, {
  getQuestions,
} from "components/DataEntry/DataEntryHeader/DataEntryHeader";
import SemanticDomainWithSubdomains, { baseDomain } from "types/SemanticDomain";

const createMockStore = configureMockStore([]);
const mockStore = createMockStore({});
const mockCallback = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Tests DataEntryHeader", () => {
  it("No questions should disable switch and show no questions", () => {
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
  _domain: SemanticDomainWithSubdomains,
  _questionsVisible: boolean,
  _mockCallback: jest.Mock
): ReactTestInstance {
  return renderer.create(
    <Provider store={mockStore}>
      <DataEntryHeader
        domain={_domain}
        questionsVisible={_questionsVisible}
        setQuestionVisibility={_mockCallback}
      />
    </Provider>
  ).root;
}
