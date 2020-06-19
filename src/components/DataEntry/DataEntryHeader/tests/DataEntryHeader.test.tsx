import React from "react";
import { Provider } from "react-redux";
import DataEntryHeader from "../DataEntryHeader";
import configureMockStore from "redux-mock-store";
import renderer, {
  ReactTestRenderer,
  ReactTestInstance,
} from "react-test-renderer";
import { baseDomain } from "../../../../types/SemanticDomain";

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
  it("No questions should disable switch and show no questions", () => {});

  it("Questions Visible should show questions", () => {});

  it("Questions not visible should hide questions", () => {});

  fit("Callback should be called on switch click", () => {
    let dataEntryHeaders = testRenderer.root.findAllByType(DataEntryHeader);
    expect(dataEntryHeaders.length).toBe(1);
    var dataEntryHeaderHandle: ReactTestInstance = dataEntryHeaders[0];
    const mockCallback = jest.fn((vis) => !vis);
    dataEntryHeaderHandle.instance.props = {
      setQuestionVisibility: mockCallback,
      questions: ["Question 1"],
    };

    var sw = testRenderer.root.findByProps({
      id: "questionVisibilitySwitch",
    });
    sw.props.onChange();
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });
});
