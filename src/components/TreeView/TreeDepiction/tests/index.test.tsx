import { ThemeProvider } from "@mui/material/styles";
import { type ReactTestRenderer, act, create } from "react-test-renderer";

import { SemanticDomainTreeNode } from "api/models";
import TreeDepiction from "components/TreeView/TreeDepiction";
import testDomainMap, {
  mapIds,
} from "components/TreeView/tests/SemanticDomainMock";
import theme from "types/theme";
import { setMatchMedia } from "utilities/testRendererUtilities";

let treeMaster: ReactTestRenderer;

beforeAll(async () => {
  // Required (along with a `ThemeProvider`) for `useMediaQuery` to work
  setMatchMedia();
});

describe("Tests AddWords", () => {
  testFromNode("Renders correctly: from parent", testDomainMap[mapIds.parent]);
  testFromNode(
    "Renders correctly: node w/ even # of subdomains",
    testDomainMap[mapIds.evenKid]
  );
  testFromNode(
    "Renders correctly: node w/ odd # of subdomains",
    testDomainMap[mapIds.oddKid]
  );
  testFromNode(
    "Renders correctly: node w/ 1 subdomains and 2 siblings",
    testDomainMap[mapIds.longKid]
  );
  testFromNode(
    "Renders correctly: node w/ 1 subdomains and no siblings",
    testDomainMap[mapIds.depth3]
  );
  testFromNode(
    "Renders correctly: node w/ no subdomains",
    testDomainMap[mapIds.depth5]
  );
});

// Perform a snapshot test
function testFromNode(message: string, node: SemanticDomainTreeNode): void {
  it(message, async () => {
    await createTree(node);
    expect(treeMaster.toJSON()).toMatchSnapshot();
  });
}

async function createTree(domain: SemanticDomainTreeNode): Promise<void> {
  await act(async () => {
    treeMaster = create(
      <ThemeProvider theme={theme}>
        <TreeDepiction currentDomain={domain} animate={jest.fn()} />
      </ThemeProvider>
    );
  });
}
