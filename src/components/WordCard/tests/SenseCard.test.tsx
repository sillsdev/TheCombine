import { act, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import { GramCatGroup, type Sense } from "api/models";
import MockBypassPartOfSpeechButton from "components/Buttons/PartOfSpeechButton";
import { defaultState } from "components/Project/ProjectReduxTypes";
import { domainLabel } from "components/WordCard/DomainChip";
import SenseCard, { partOfSpeechButtonId } from "components/WordCard/SenseCard";
import { type StoreState } from "rootRedux/types";
import { Hash } from "types/hash";
import { newSemanticDomain } from "types/semanticDomain";
import { newSense } from "types/word";

jest.mock("components/Buttons", () => ({
  PartOfSpeechButton: MockBypassPartOfSpeechButton,
}));

const mockSemDomNames: Hash<string> = { ["1"]: "I", ["2"]: "II" };
const mockState = (): Partial<StoreState> => ({
  currentProjectState: { ...defaultState, semanticDomains: mockSemDomNames },
});

const renderSenseCard = async (sense?: Sense): Promise<void> => {
  await act(async () => {
    render(
      <Provider store={configureMockStore()(mockState())}>
        <SenseCard sense={sense ?? newSense()} />
      </Provider>
    );
  });
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("SenseCard", () => {
  it("has an icon for part of speech (if not GramCatGroup.Unspecified)", async () => {
    const sense = newSense("gloss");
    await renderSenseCard(sense);
    expect(screen.queryByTestId(partOfSpeechButtonId(sense.guid))).toBeNull();

    sense.grammaticalInfo = {
      catGroup: GramCatGroup.Noun,
      grammaticalCategory: "n",
    };
    await renderSenseCard(sense);
    expect(screen.queryByTestId(partOfSpeechButtonId(sense.guid))).toBeTruthy();
  });

  it("uses in-redux-state domain names when available", async () => {
    const sense = newSense("gloss");
    const dom0 = newSemanticDomain("0", "not in state");
    const dom1 = newSemanticDomain("1", "different from in state");
    sense.semanticDomains = [dom0, dom1];
    await renderSenseCard(sense);

    // Ensure 0's name is used since its id is not in-state
    expect(screen.queryByText(domainLabel(dom0))).toBeTruthy();

    // Ensure 1's name is replace by the in-state name
    expect(screen.queryByText(domainLabel(dom1))).toBeNull();
    const dom1b = { ...dom1, name: mockSemDomNames["1"] };
    expect(screen.queryByText(domainLabel(dom1b))).toBeTruthy();
  });
});
