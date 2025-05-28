import { act, render, screen } from "@testing-library/react";

import { SemanticDomainTreeNode } from "api/models";
import CurrentRow from "components/TreeView/TreeDepiction/CurrentRow";
import testDomainMap, {
  mapIds,
} from "components/TreeView/tests/SemanticDomainMock";

describe("CurrentRow", () => {
  for (const small of [false, true]) {
    describe(small ? "renders narrow" : "renders wide", () => {
      test("with no parent and no siblings", async () => {
        await createTree(testDomainMap[mapIds.head], small);
        expect(screen.getAllByRole("button")).toHaveLength(1);
      });

      test("with parent and no siblings", async () => {
        await createTree(testDomainMap[mapIds.parent], small);
        expect(screen.getAllByRole("button")).toHaveLength(2);
      });

      test("with parent and 1 sibling", async () => {
        await createTree(testDomainMap[mapIds.firstKid], small);
        expect(screen.getAllByRole("button")).toHaveLength(3);
      });

      test("with parent and 2 siblings", async () => {
        await createTree(testDomainMap[mapIds.middleKid], small);
        expect(screen.getAllByRole("button")).toHaveLength(4);
      });
    });
  }
});

async function createTree(
  domain: SemanticDomainTreeNode,
  small: boolean
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
