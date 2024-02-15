import { Button, TextField } from "@mui/material";
import { type ReactTestRenderer, act, create } from "react-test-renderer";

import "tests/reactI18nextMock";

import ProjectName from "components/ProjectSettings/ProjectName";
import { randomProject } from "types/project";

jest.mock("react-toastify", () => ({
  toast: { error: () => mockToastError() },
}));

const mockToastError = jest.fn();

const mockSetProject = jest.fn();

const mockProject = randomProject();

let testRenderer: ReactTestRenderer;

const renderName = async (): Promise<void> => {
  await act(async () => {
    testRenderer = create(
      <ProjectName project={mockProject} setProject={mockSetProject} />
    );
  });
};

describe("ProjectName", () => {
  it("updates project name", async () => {
    await renderName();
    const textField = testRenderer.root.findByType(TextField);
    const saveButton = testRenderer.root.findByType(Button);
    const name = "new-project-name";
    mockSetProject.mockResolvedValueOnce({});
    await act(async () =>
      textField.props.onChange({ target: { value: name } })
    );
    await act(async () => saveButton.props.onClick());
    expect(mockSetProject).toHaveBeenCalledWith({ ...mockProject, name });
  });

  it("toasts on error", async () => {
    await renderName();
    const textField = testRenderer.root.findByType(TextField);
    const saveButton = testRenderer.root.findByType(Button);
    await act(async () =>
      textField.props.onChange({ target: { value: "new-name" } })
    );
    mockSetProject.mockRejectedValueOnce({});
    expect(mockToastError).not.toHaveBeenCalled();
    await act(async () => saveButton.props.onClick());
    expect(mockToastError).toHaveBeenCalledTimes(1);
  });
});
