import renderer, { ReactTestRenderer } from "react-test-renderer";

import TreeDepiction from "components/TreeView/TreeDepiction";
import TreeSemanticDomain from "components/TreeView/TreeSemanticDomain";
import { domMap } from "components/TreeView/tests/MockSemanticDomain";

var treeMaster: ReactTestRenderer;
describe("Tests AddWords", () => {
  testFromNode("Renders correctly: from parent", domMap["1"]);
  testFromNode(
    "Renders correctly: node w/ even # of subdomains",
    domMap["1.0"]
  );
  testFromNode("Renders correctly: node w/ odd # of subdomains", domMap["1.1"]);
  testFromNode(
    "Renders correctly: node w/ 1 subdomains and 2 siblings",
    domMap["1.2"]
  );
  testFromNode(
    "Renders correctly: node w/ 1 subdomains and no siblings",
    domMap["1.2.1"]
  );
  testFromNode("Renders correctly: node w/ no subdomains", domMap["1.2.1.1.1"]);
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
