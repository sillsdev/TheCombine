import { ThemeProvider } from "@mui/material/styles";
import { act, render } from "@testing-library/react";

import ProjectScreen from "components/ProjectScreen";
import theme from "types/theme";

jest.mock("components/ProjectScreen/ChooseProject", () => "div");
jest.mock("components/ProjectScreen/CreateProject", () => "div");
jest.mock("rootRedux/hooks", () => ({
  useAppDispatch: () => () => mockDispatch(),
}));

const mockDispatch = jest.fn();

it("renders without crashing", () => {
  act(() => {
    render(
      <ThemeProvider theme={theme}>
        <ProjectScreen />
      </ThemeProvider>
    );
  });
  expect(mockDispatch).toHaveBeenCalledTimes(2);
});
