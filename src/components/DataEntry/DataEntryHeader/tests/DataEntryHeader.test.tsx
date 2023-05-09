import { Provider } from "react-redux";
import renderer, { ReactTestInstance } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/mockReactI18next";

import { SemanticDomainFull } from "api";
import DataEntryHeader from "components/DataEntry/DataEntryHeader/DataEntryHeader";
import { newSemanticDomain } from "types/semanticDomain";

const mockStore = configureMockStore()();
const visSwitchId = "questionVisibilitySwitch";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("DataEntryHeader", () => {
  it("No questions should disable switch and show no questions", () => {
    const instance = createDataEntryHeaderInstance(
      newSemanticDomain(),
      true,
      jest.fn()
    );
    const questionSwitch = instance.findByProps({ id: visSwitchId });
    expect(questionSwitch.props.disabled).toBeTruthy();
  });

  it("Questions Visible should show questions", () => {
    const newDom = { ...newSemanticDomain(), questions: ["Q1", "Q2", "Q3"] };

    const instance = createDataEntryHeaderInstance(newDom, true, jest.fn());
    newDom.questions.forEach((q, i) => {
      expect(instance.findByProps({ id: `q${i}` }).props.children).toEqual(q);
    });
  });

  it("Questions not Visible should not show questions", () => {
    const newDom = { ...newSemanticDomain(), questions: ["Q1", "Q2", "Q3"] };

    const instance = createDataEntryHeaderInstance(newDom, false, jest.fn());
    newDom.questions.forEach((_, i) => {
      expect(instance.findAllByProps({ id: `q${i}` })).toHaveLength(0);
    });
  });

  it("Callback should be called on switch click", () => {
    const newDomain = { ...newSemanticDomain(), questions: ["Q1", "Q2"] };
    const mockCallback = jest.fn();

    const instance: ReactTestInstance = createDataEntryHeaderInstance(
      newDomain,
      false,
      mockCallback
    );

    instance.findByProps({ id: visSwitchId }).props.onChange();
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });
});

function createDataEntryHeaderInstance(
  _domain: SemanticDomainFull,
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
