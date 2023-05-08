import renderer from "react-test-renderer";

import ProjectScreen from "components/ProjectScreen";

jest.mock("components/ProjectScreen/ChooseProject", () => "div");
jest.mock("components/ProjectScreen/CreateProject", () => "div");
jest.mock("types/hooks", () => ({
  useAppDispatch: () => () => mockDispatch(),
}));

const mockDispatch = jest.fn();

it("renders without crashing", () => {
  renderer.act(() => {
    renderer.create(<ProjectScreen />);
  });
  expect(mockDispatch).toBeCalledTimes(2);
});
