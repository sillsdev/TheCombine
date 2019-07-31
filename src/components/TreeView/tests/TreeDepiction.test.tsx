import React from "react";
import renderer, { ReactTestRenderer } from "react-test-renderer";
import TreeDepiction from "../TreeDepiction";
import MockTree from "./MockSemanticTree";
import SemanticDomainWithSubdomains from "../SemanticDomain";

var treeMaster: ReactTestRenderer;
describe("Tests AddWords", () => {
  testFromNode("Renders correctly: from Parent", MockTree);
  testFromNode(
    "Renders correctly: node w/ even # of subdomains",
    MockTree.subdomains[0]
  );
  testFromNode(
    "Renders correctly: node w/ odd # of subdomains",
    MockTree.subdomains[1]
  );
  testFromNode(
    "Renders correctly: node w/ 1 subdomains",
    MockTree.subdomains[2]
  );
  testFromNode(
    "Renders correctly: node w/ no subdomains",
    MockTree.subdomains[2].subdomains[0]
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
