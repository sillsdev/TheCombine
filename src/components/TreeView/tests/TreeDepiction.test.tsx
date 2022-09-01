import renderer, { ReactTestRenderer } from "react-test-renderer";

import TreeDepiction from "components/TreeView/TreeDepiction";
import domMap, { mapIds } from "components/TreeView/tests/MockSemanticDomain";
import { TreeSemanticDomain } from "types/semanticDomain";

var treeMaster: ReactTestRenderer;
describe("Tests AddWords", () => {
  testFromNode("Renders correctly: from parent", domMap[mapIds.parent]);
  testFromNode(
    "Renders correctly: node w/ even # of subdomains",
    domMap[mapIds.evenKid]
  );
  testFromNode(
    "Renders correctly: node w/ odd # of subdomains",
    domMap[mapIds.oddKid]
  );
  testFromNode(
    "Renders correctly: node w/ 1 subdomains and 2 siblings",
    domMap[mapIds.longKid]
  );
  testFromNode(
    "Renders correctly: node w/ 1 subdomains and no siblings",
    domMap[mapIds.depth3]
  );
  testFromNode(
    "Renders correctly: node w/ no subdomains",
    domMap[mapIds.depth5]
  );
});

// Perform a snapshot test
function testFromNode(message: string, node: TreeSemanticDomain) {
  it(message, () => {
    createTree(node);
    expect(treeMaster.toJSON()).toMatchSnapshot();
  });
}

function createTree(domain: TreeSemanticDomain) {
  renderer.act(() => {
    treeMaster = renderer.create(
      <TreeDepiction
        currentDomain={domain}
        domainMap={domMap}
        animate={jest.fn()}
      />
    );
  });
}
