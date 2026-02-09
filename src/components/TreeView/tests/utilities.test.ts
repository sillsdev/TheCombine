import { getAugmentedTreeNode } from "components/TreeView/utilities";
import { newSemanticDomain, treeNodeFromSemDom } from "types/semanticDomain";

jest.mock("backend", () => ({
  getSemanticDomainTreeNode: (id: string, lang?: string) =>
    mockGetSemanticDomainTreeNode(id, lang),
  getSemanticDomainTreeNodeByName: (name: string, lang?: string) =>
    mockGetSemanticDomainTreeNodeByName(name, lang),
}));

const mockGetSemanticDomainTreeNode = jest.fn();
const mockGetSemanticDomainTreeNodeByName = jest.fn();

beforeEach(() => {
  mockGetSemanticDomainTreeNode.mockImplementation(
    (id: string, lang?: string) =>
      Promise.resolve(
        treeNodeFromSemDom(newSemanticDomain(id, "Domain Name", lang))
      )
  );
  mockGetSemanticDomainTreeNodeByName.mockImplementation(
    (name: string, lang?: string) =>
      Promise.resolve(
        treeNodeFromSemDom(newSemanticDomain("9.9.9.9.9", name, lang))
      )
  );
});

describe("getAugmentedTreeNode", () => {
  it("fetches numerical queries by id", async () => {
    await getAugmentedTreeNode("1.2.3", "en", []);

    expect(mockGetSemanticDomainTreeNode).toHaveBeenCalledTimes(1);
    expect(mockGetSemanticDomainTreeNodeByName).not.toHaveBeenCalled();
  });

  it("fetches alphabetic queries by name", async () => {
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
    expect(augmented?.previous?.name).toEqual(sib.name);
    expect(augmented?.children[0].id).toEqual(kid.id);
    expect(augmented?.children[0].name).toEqual(kid.name);
  });

  it("ignores custom domains of different language", async () => {
    const customDom = newSemanticDomain("2.6.0", "custom", "red-fish-lang");
    mockGetSemanticDomainTreeNode.mockResolvedValueOnce(undefined);
    expect(
      await getAugmentedTreeNode(customDom.id, "blue-fish-lang", [customDom])
    ).toBeUndefined();
  });

  it("gets parent of custom domain", async () => {
    const customDom = newSemanticDomain("2.4.6.8.0", "custom", "ar");
    const augmentedDom = await getAugmentedTreeNode(
      customDom.id,
      customDom.lang,
      [customDom]
    );

    expect(augmentedDom?.id).toEqual(customDom.id);
    expect(augmentedDom?.name).toEqual(customDom.name);
    expect(augmentedDom?.children).toHaveLength(0);
    expect(augmentedDom?.parent?.id).toEqual("2.4.6.8");
    expect(augmentedDom?.parent?.lang).toEqual(customDom.lang);
  });
});
