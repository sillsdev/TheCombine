import { act, render, waitFor } from "@testing-library/react";

import * as backend from "backend";
import * as LocalStorage from "backend/localStorage";
import TreeDepiction from "components/TreeView/TreeDepiction";
import testDomainMap, {
  mapIds,
} from "components/TreeView/tests/SemanticDomainMock";

// Mock the backend API
jest.mock("backend");
const mockGetDomainSenseCount = backend.getDomainSenseCount as jest.Mock;
const mockGetDomainProgressProportion = backend.getDomainProgressProportion as jest.Mock;

beforeAll(() => {
  LocalStorage.setProjectId("test-project-id");
  mockGetDomainSenseCount.mockResolvedValue(0);
  mockGetDomainProgressProportion.mockResolvedValue(0.5);
});

describe("TreeDepiction", () => {
  for (const small of [false, true]) {
    describe(small ? "renders narrow" : "renders wide", () => {
      for (const id of Object.values(mapIds)) {
        test(`domain ${id}`, async () => {
          await act(async () => {
            render(
              <TreeDepiction
                animate={jest.fn()}
                currentDomain={testDomainMap[id]}
                small={small}
              />
            );
            // Wait for promises to resolve
            await new Promise((resolve) => setTimeout(resolve, 0));
          });
        });
      }
    });
  }
});
