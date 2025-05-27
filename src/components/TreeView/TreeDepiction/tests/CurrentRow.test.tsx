import { act, render, screen } from "@testing-library/react";

import { SemanticDomainTreeNode } from "api/models";
import CurrentRow from "components/TreeView/TreeDepiction/CurrentRow";
import testDomainMap, {
  mapIds,
} from "components/TreeView/tests/SemanticDomainMock";

describe("CurrentRow", () => {
  describe("wide", () => {
    it("renders with no parent and no siblings", async () => {
      await createTree(testDomainMap[mapIds.head]);
      expect(screen.getAllByRole("button")).toHaveLength(1);
    });

    it("renders with parent and no siblings", async () => {
      await createTree(testDomainMap[mapIds.parent]);
      expect(screen.getAllByRole("button")).toHaveLength(2);
    });

    it("renders with parent and 1 sibling", async () => {
      await createTree(testDomainMap[mapIds.firstKid]);
      expect(screen.getAllByRole("button")).toHaveLength(3);
    });

    it("renders with parent and 2 siblings", async () => {
      await createTree(testDomainMap[mapIds.middleKid]);
      expect(screen.getAllByRole("button")).toHaveLength(4);
    });
  });

  describe("narrow", () => {
    it("renders with no parent and no siblings", async () => {
      await createTree(testDomainMap[mapIds.head]);
      expect(screen.getAllByRole("button")).toHaveLength(1);
    });

    it("renders with parent and no siblings", async () => {
      await createTree(testDomainMap[mapIds.parent], true);
      expect(screen.getAllByRole("button")).toHaveLength(2);
    });

    it("renders with parent and 1 sibling", async () => {
      await createTree(testDomainMap[mapIds.firstKid], true);
      expect(screen.getAllByRole("button")).toHaveLength(3);
    });

    it("renders with parent and 2 siblings", async () => {
      await createTree(testDomainMap[mapIds.middleKid], true);
      expect(screen.getAllByRole("button")).toHaveLength(4);
    });
  });
});

async function createTree(
  domain: SemanticDomainTreeNode,
  small = false
): Promise<void> {
  await act(async () => {
    render(
      <CurrentRow
        animate={jest.fn()}
        colWidth={100}
        currentDomain={domain}
        small={small}
      />
    );
  });
}
