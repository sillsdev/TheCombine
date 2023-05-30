import renderer from "react-test-renderer";

import "tests/reactI18nextMock";

import ClickableAvatar from "components/UserSettings/ClickableAvatar";
import { UserSettings } from "components/UserSettings/UserSettings";
import { newUser } from "types/user";

let testRenderer: renderer.ReactTestRenderer;

const mockUser = newUser("name", "username");

const renderUserSettings = (user = mockUser): void => {
  renderer.act(() => {
    testRenderer = renderer.create(<UserSettings user={user} />);
  });
};

describe("UserSettings", () => {
  it("renders", () => {
    renderUserSettings();
    expect(testRenderer.root.findAllByType(ClickableAvatar)).toHaveLength(1);
  });
});
