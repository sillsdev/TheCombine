import { ThemeProvider } from "@mui/material/styles";
import { act, render } from "@testing-library/react";

import { SemanticDomainTreeNode } from "api/models";
import TreeDepiction from "components/TreeView/TreeDepiction";
import testDomainMap, {
  mapIds,
} from "components/TreeView/tests/SemanticDomainMock";
import theme from "types/theme";
import { setMatchMedia } from "utilities/testRendererUtilities";

beforeAll(async () => {
  // Required (along with a `ThemeProvider`) for `useMediaQuery` to work
  setMatchMedia();
});

describe("TreeDepiction", () => {
  testFromNode("from parent", testDomainMap[mapIds.parent]);
  testFromNode("node w/ even # of subdomains", testDomainMap[mapIds.evenKid]);
  testFromNode("node w/ odd # of subdomains", testDomainMap[mapIds.oddKid]);
  testFromNode(
    "node w/ 1 subdomains and 2 siblings",
    testDomainMap[mapIds.longKid]
  );
  testFromNode(
    "node w/ 1 subdomains and no siblings",
    testDomainMap[mapIds.depth3]
  );
  testFromNode("node w/ no subdomains", testDomainMap[mapIds.depth5]);
});

function testFromNode(message: string, node: SemanticDomainTreeNode): void {
  it(message, async () => {
    await createTree(node);
  });
}

async function createTree(domain: SemanticDomainTreeNode): Promise<void> {
  await act(async () => {
    render(
      <ThemeProvider theme={theme}>
        <TreeDepiction currentDomain={domain} animate={jest.fn()} />
      </ThemeProvider>
    );
  });
}
