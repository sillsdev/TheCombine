import renderer from "react-test-renderer";

import "tests/reactI18nextMock";

import AvatarUpload from "components/UserSettings/AvatarUpload";

let testRenderer: renderer.ReactTestRenderer;

describe("AvatarUpload", () => {
  it("renders", () => {
    renderer.act(() => {
      testRenderer = renderer.create(<AvatarUpload />);
    });
    expect(testRenderer.root.findAllByType(AvatarUpload)).toHaveLength(1);
  });
});
