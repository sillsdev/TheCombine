import { getAugmentedTreeNode } from "components/TreeView/utilities";
import { newSemanticDomain, treeNodeFromSemDom } from "types/semanticDomain";

jest.mock("backend", () => ({
  getSemanticDomainTreeNode: (id: string, lang?: string) =>
    mockGetSemanticDomainTreeNode(id, lang),
  getSemanticDomainTreeNodeByName: (id: string, lang?: string) =>
    mockGetSemanticDomainTreeNodeByName(id, lang),
}));

const mockGetSemanticDomainTreeNode = jest.fn();
const mockGetSemanticDomainTreeNodeByName = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getAugmentedTreeNode", () => {
  it("fetches numerical queries by id", async () => {
    await getAugmentedTreeNode("1.2.3", "en", []);

    expect(mockGetSemanticDomainTreeNode).toHaveBeenCalledTimes(1);
    expect(mockGetSemanticDomainTreeNodeByName).not.toHaveBeenCalled();
  });

  it("fetches alphabetic queries by id", async () => {
    await getAugmentedTreeNode("topic", "fr", []);

    expect(mockGetSemanticDomainTreeNode).not.toHaveBeenCalled();
    expect(mockGetSemanticDomainTreeNodeByName).toHaveBeenCalledTimes(1);
  });

  it("adds custom child and previous sibling", async () => {
    const dom = newSemanticDomain("5.4.3.2.1", "topic", "pt");
    const sib = newSemanticDomain("5.4.3.2.0", "related custom", dom.lang);
    const kid = newSemanticDomain("5.4.3.2.1.0", "custom subtopic", dom.lang);
    mockGetSemanticDomainTreeNode.mockResolvedValueOnce(
      treeNodeFromSemDom(dom)
    );
    const augmented = await getAugmentedTreeNode(dom.id, dom.lang, [kid, sib]);

    expect(augmented?.previous?.id).toEqual(sib.id);
    expect(augmented?.children[0].id).toEqual(kid.id);
  });

  it("ignores custom domains of different language", async () => {
    const customDom = newSemanticDomain("2.6.0", "custom", "red-fish");
    expect(
      await getAugmentedTreeNode(customDom.id, "blue-fish", [customDom])
    ).toBeUndefined();
  });

  it("tries to get parent of custom domain", async () => {
    const customDom = newSemanticDomain("2.4.6.8.0", "custom", "ar");
    expect(
      await getAugmentedTreeNode(customDom.id, customDom.lang, [customDom])
    ).not.toBeUndefined();

    expect(mockGetSemanticDomainTreeNode).toHaveBeenCalledTimes(1);
    const mockCall = mockGetSemanticDomainTreeNode.mock.calls[0];
    expect(mockCall).toEqual(["2.4.6.8", customDom.lang]);
    expect(mockGetSemanticDomainTreeNodeByName).not.toHaveBeenCalled();
  });
});
