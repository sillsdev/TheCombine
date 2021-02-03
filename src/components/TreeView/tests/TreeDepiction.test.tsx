import React from "react";
import renderer, { ReactTestRenderer } from "react-test-renderer";

import TreeDepiction from "components/TreeView/TreeDepiction";
import MockDomain from "components/TreeView/tests/MockSemanticDomain";
import SemanticDomainWithSubdomains from "types/SemanticDomain";

var treeMaster: ReactTestRenderer;
describe("Tests AddWords", () => {
  testFromNode("Renders correctly: from Parent", MockDomain);
  testFromNode(
    "Renders correctly: node w/ even # of subdomains",
    MockDomain.subdomains[0]
  );
  testFromNode(
    "Renders correctly: node w/ odd # of subdomains",
    MockDomain.subdomains[1]
  );
  testFromNode(
    "Renders correctly: node w/ 1 subdomains",
    MockDomain.subdomains[2]
  );
  testFromNode(
    "Renders correctly: node w/ no subdomains",
    MockDomain.subdomains[2].subdomains[0]
  );
});

// Perform a snapshot test
function testFromNode(message: string, node: SemanticDomainWithSubdomains) {
  it(message, () => {
    createTree(node);
    expect(treeMaster.toJSON()).toMatchSnapshot();
  });
}

function createTree(domain: SemanticDomainWithSubdomains) {
  renderer.act(() => {
    treeMaster = renderer.create(
      <TreeDepiction currentDomain={domain} animate={jest.fn()} />
    );
  });
}
