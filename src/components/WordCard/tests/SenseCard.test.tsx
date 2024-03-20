import { Provider } from "react-redux";
import { type ReactTestRenderer, act, create } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { GramCatGroup, type Sense } from "api";
import { PartOfSpeechButton } from "components/Buttons";
import { defaultState } from "components/Project/ProjectReduxTypes";
import DomainChip from "components/WordCard/DomainChip";
import SenseCard from "components/WordCard/SenseCard";
import { type StoreState } from "types";
import { Hash } from "types/hash";
import { newSemanticDomain } from "types/semanticDomain";
import { newSense } from "types/word";

const mockSemDomNames: Hash<string> = { ["1"]: "I", ["2"]: "II" };
const mockState = (): Partial<StoreState> => ({
  currentProjectState: { ...defaultState, semanticDomains: mockSemDomNames },
});

let renderer: ReactTestRenderer;

const renderSenseCard = async (sense?: Sense): Promise<void> => {
  await act(async () => {
    renderer = create(
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
  it("has an icon for non-Unspecified part of speech", async () => {
    await renderSenseCard();
    expect(() => renderer.root.findByType(PartOfSpeechButton)).toThrow();

    const sense = newSense("gloss");
    sense.grammaticalInfo = {
      catGroup: GramCatGroup.Noun,
      grammaticalCategory: "n",
    };
    await renderSenseCard(sense);
    renderer.root.findByType(PartOfSpeechButton);
  });

  it("uses in-redux-state domain names when available", async () => {
    const sense = newSense("gloss");
    const name0 = "not in state";
    const name1 = "different from in state";
    sense.semanticDomains = [
      newSemanticDomain("0", name0),
      newSemanticDomain("1", name1),
    ];
    await renderSenseCard(sense);
    expect(renderer.root.findAllByType(DomainChip)).toHaveLength(2);

    // Ensure 0's name is used since its id is not in-state
    renderer.root.findByProps({ label: `0: ${name0}` });

    // Ensure 1's name is replace by the in-state name
    const label1no = `1: ${name1}`;
    expect(() => renderer.root.findByProps({ label: label1no })).toThrow();
    const label1yes = `1: ${mockSemDomNames["1"]}`;
    renderer.root.findByProps({ label: label1yes });
  });
});
