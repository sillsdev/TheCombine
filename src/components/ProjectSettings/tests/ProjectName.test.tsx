import { Button, TextField } from "@mui/material";
import renderer from "react-test-renderer";

import ProjectName from "components/ProjectSettings/ProjectName";
import { randomProject } from "types/project";

jest.mock("react-toastify", () => ({
  toast: { error: () => mockToastError() },
}));

const mockToastError = jest.fn();

const mockSetProject = jest.fn();

const mockProject = randomProject();

let testRenderer: renderer.ReactTestRenderer;

const renderName = async (): Promise<void> => {
  await renderer.act(async () => {
    testRenderer = renderer.create(
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
    await renderer.act(async () =>
      textField.props.onChange({ target: { value: name } })
    );
    await renderer.act(async () => saveButton.props.onClick());
    expect(mockSetProject).toHaveBeenCalledWith({ ...mockProject, name });
  });

  it("toasts on error", async () => {
    await renderName();
    const textField = testRenderer.root.findByType(TextField);
    const saveButton = testRenderer.root.findByType(Button);
    await renderer.act(async () =>
      textField.props.onChange({ target: { value: "new-name" } })
    );
    mockSetProject.mockRejectedValueOnce({});
    expect(mockToastError).not.toHaveBeenCalled();
    await renderer.act(async () => saveButton.props.onClick());
    expect(mockToastError).toHaveBeenCalledTimes(1);
  });
});
