import { act, render, screen } from "@testing-library/react";

import { SemanticDomainTreeNode } from "api/models";
import CurrentRow from "components/TreeView/TreeDepiction/CurrentRow";
import testDomainMap, {
  mapIds,
} from "components/TreeView/tests/SemanticDomainMock";

describe("CurrentRow", () => {
  it("renders with no siblings", async () => {
    await createTree(testDomainMap[mapIds.parent]);
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it("renders with 1 sibling", async () => {
    await createTree(testDomainMap[mapIds.firstKid]);
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  it("renders with 2 siblings", async () => {
    await createTree(testDomainMap[mapIds.middleKid]);
    expect(screen.getAllByRole("button")).toHaveLength(3);
  });

  it("hides siblings when small", async () => {
    await createTree(testDomainMap[mapIds.middleKid], true);
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });
});

async function createTree(
  domain: SemanticDomainTreeNode,
  small = false
): Promise<void> {
  await act(async () => {
    render(
      <CurrentRow animate={jest.fn()} currentDomain={domain} small={small} />
    );
  });
}
