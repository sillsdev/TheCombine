import { match } from "css-mediaquery";
import { ReactTestRenderer, act, create } from "react-test-renderer";

import "localization/mocks/reactI18nextMock";

import { SemanticDomainTreeNode } from "api/models";
import TreeDepiction from "components/TreeView/TreeDepiction";
import testDomainMap, {
  mapIds,
} from "components/TreeView/tests/SemanticDomainMock";

let treeMaster: ReactTestRenderer;

// Modified from mui.com/material-ui/react-use-media-query/#testing
const createMatchMedia = (
  width: number
): ((query: string) => MediaQueryList) => {
  return (query: string) =>
    ({
      matches: match(query, { width }),
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }) as any;
};

beforeAll(async () => {
  // Required for the <Hidden> elements to show up
  window.matchMedia = createMatchMedia(window.innerWidth);
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
      <TreeDepiction currentDomain={domain} animate={jest.fn()} />
    );
  });
}
