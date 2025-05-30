import { act, render } from "@testing-library/react";

import TreeDepiction from "components/TreeView/TreeDepiction";
import testDomainMap, {
  mapIds,
} from "components/TreeView/tests/SemanticDomainMock";

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
