import React from "react";
import renderer, { ReactTestRenderer } from "react-test-renderer";
import TreeDepiction from "../TreeDepiction";
import MockTree from "./MockSemanticTree";
import SemanticDomain from "../SemanticDomain";

var treeMaster: ReactTestRenderer;
describe("Tests AddWords", () => {
  testFromNode("Renders correctly: from Parent", MockTree);
  testFromNode(
    "Renders correctly: node w/ even # of subdomains",
    MockTree.subDomains[0]
  );
  testFromNode(
    "Renders correctly: node w/ odd # of subdomains",
    MockTree.subDomains[1]
  );
  testFromNode(
    "Renders correctly: node w/ 1 subdomains",
    MockTree.subDomains[2]
  );
  testFromNode(
    "Renders correctly: node w/ no subdomains",
    MockTree.subDomains[2].subDomains[0]
  );
});

// Perform a snapshot test
function testFromNode(message: string, node: SemanticDomain) {
  it(message, () => {
    createTree(node);
    expect(treeMaster.toJSON()).toMatchSnapshot();
  });
}

function createTree(domain: SemanticDomain) {
  renderer.act(() => {
    treeMaster = renderer.create(
      <TreeDepiction currentDomain={domain} animate={jest.fn()} />
    );
  });
}
