import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SemanticDomainTreeNode } from "api/models";
import CurrentRow from "components/TreeView/TreeDepiction/CurrentRow";
import testDomainMap, {
  mapIds,
} from "components/TreeView/tests/SemanticDomainMock";

jest.mock("backend", () => ({
  getDomainProgress: () => mockGetDomainProgress(),
  getDomainWordCount: () => mockGetDomainWordCount(),
}));

const mockAnimate = jest.fn();
const mockGetDomainProgress = jest.fn();
const mockGetDomainWordCount = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  mockGetDomainProgress.mockResolvedValue(0.5);
  mockGetDomainWordCount.mockResolvedValue(0);
});

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

    describe(small ? "clickability narrow" : "clickability wide", () => {
      test("root is not clickable", async () => {
        await createTree(testDomainMap[mapIds.head], small);
        expect(screen.getByRole("button")).toBeDisabled();
      });

      test("everything else is clickable", async () => {
        await createTree(testDomainMap[mapIds.middleKid], small);
        const domainButtons = screen.getAllByRole("button");
        expect(domainButtons).toHaveLength(4);

        for (let i = 0; i < domainButtons.length; i++) {
          const button = domainButtons[i];
          expect(button).not.toBeDisabled();

          expect(mockAnimate).toHaveBeenCalledTimes(i);
          await userEvent.click(button);
          expect(mockAnimate).toHaveBeenCalledTimes(i + 1);
        }
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
        animate={mockAnimate}
        colWidth={100}
        currentDomain={domain}
        small={small}
      />
    );
  });
}
