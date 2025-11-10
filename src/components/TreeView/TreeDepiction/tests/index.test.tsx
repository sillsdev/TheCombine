import { act, render } from "@testing-library/react";

import TreeDepiction from "components/TreeView/TreeDepiction";
import testDomainMap, {
  mapIds,
} from "components/TreeView/tests/SemanticDomainMock";

// Mock the backend API
jest.mock("backend", () => ({
  getDomainSenseCount: jest.fn(() => Promise.resolve(0)),
  getDomainProgressProportion: jest.fn(() => Promise.resolve(0.5)),
}));

// Mock the Redux hooks
jest.mock("rootRedux/hooks", () => ({
  useAppSelector: jest.fn(() => "test-project-id"),
}));

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
          });
        });
      }
    });
  }
});
