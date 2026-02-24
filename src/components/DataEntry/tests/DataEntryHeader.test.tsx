import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import { SemanticDomainFull } from "api/models";
import DataEntryHeader from "components/DataEntry/DataEntryHeader";
import { newSemanticDomain } from "types/semanticDomain";

const mockCallback = jest.fn();
const mockStore = configureMockStore()();
const questions = ["Q1", "Q2", "Q3"];

const newDomainWithQuestions = (): SemanticDomainFull => ({
  ...newSemanticDomain(),
  questions: [...questions],
});

describe("DataEntryHeader", () => {
  it("No questions should disable switch and show no questions", async () => {
    await renderDataEntryHeader(newSemanticDomain(), true);
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });

  it("Questions Visible should show questions", async () => {
    await renderDataEntryHeader(newDomainWithQuestions(), true);
    questions.forEach((q) => expect(screen.getByText(q)).toBeTruthy());
  });

  it("Questions not Visible should not show questions", async () => {
    await renderDataEntryHeader(newDomainWithQuestions(), false);
    questions.forEach((q) => expect(screen.queryByText(q)).toBeNull());
  });

  it("Callback should be called on switch click", async () => {
    await renderDataEntryHeader(newDomainWithQuestions(), false);
    expect(mockCallback).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("checkbox"));
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });
});

async function renderDataEntryHeader(
  _domain: SemanticDomainFull,
  _questionsVisible: boolean
): Promise<void> {
  await act(async () => {
    render(
      <Provider store={mockStore}>
        <DataEntryHeader
          domain={_domain}
          questionsVisible={_questionsVisible}
          setQuestionVisibility={mockCallback}
        />
      </Provider>
    );
  });
}
