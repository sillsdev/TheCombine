import renderer from "react-test-renderer";

import "tests/reactI18nextMock";

import { SemanticDomainFull } from "api/models";
import * as backend from "backend";
import DataEntry, { DataEntryProps } from "components/DataEntry/DataEntry";
import { newSemanticDomainTreeNode } from "types/semanticDomain";

jest.mock("components/DataEntry/DataEntryTable", () => "div");

const mockCloseTree = jest.fn();
const mockDomain = newSemanticDomainTreeNode("mockId", "mockName", "mockLang");
const mockOpenTree = jest.fn();

let testHandle: renderer.ReactTestRenderer;

function spyOnGetSemanticDomainFull(
  domain?: SemanticDomainFull
): jest.SpyInstance {
  return jest.spyOn(backend, "getSemanticDomainFull").mockResolvedValue(domain);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("DataEntry", () => {
  it("fetches domain", async () => {
    const spyHandle = spyOnGetSemanticDomainFull();
    await renderDataEntry({ currentDomain: mockDomain });
    expect(spyHandle).toBeCalledWith(mockDomain.id, mockDomain.lang);
  });
});

async function renderDataEntry(props: Partial<DataEntryProps>): Promise<void> {
  await renderer.act(async () => {
    testHandle = renderer.create(
      <DataEntry
        currentDomain={props.currentDomain ?? newSemanticDomainTreeNode()}
        isTreeOpen={props.isTreeOpen}
        closeTree={props.closeTree ?? mockCloseTree}
        openTree={props.openTree ?? mockOpenTree}
      />
    );
  });
}
