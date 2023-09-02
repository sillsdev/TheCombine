import { Button, TextField } from "@mui/material";
import renderer from "react-test-renderer";

import "tests/reactI18nextMock";

import ProjectName from "components/ProjectSettings/ProjectName";
import { randomProject } from "types/project";

jest.mock("react-toastify", () => ({
  toast: { error: () => mockToastError() },
}));

const mockToastError = jest.fn();

const mockUpdateProject = jest.fn();

const mockProject = randomProject();

let testRenderer: renderer.ReactTestRenderer;

const renderName = async (): Promise<void> => {
  await renderer.act(async () => {
    testRenderer = renderer.create(
      <ProjectName project={mockProject} updateProject={mockUpdateProject} />
    );
  });
};

describe("ProjectName", () => {
  it("updates project name", async () => {
    await renderName();
    const textField = testRenderer.root.findByType(TextField);
    const saveButton = testRenderer.root.findByType(Button);
    const name = "new-project-name";
    mockUpdateProject.mockResolvedValueOnce({});
    await renderer.act(async () =>
      textField.props.onChange({ target: { value: name } })
    );
    await renderer.act(async () => saveButton.props.onClick());
    expect(mockUpdateProject).toBeCalledWith({ ...mockProject, name });
  });

  it("toasts on error", async () => {
    await renderName();
    const textField = testRenderer.root.findByType(TextField);
    const saveButton = testRenderer.root.findByType(Button);
    await renderer.act(async () =>
      textField.props.onChange({ target: { value: "new-name" } })
    );
    mockUpdateProject.mockRejectedValueOnce({});
    expect(mockToastError).not.toBeCalled();
    await renderer.act(async () => saveButton.props.onClick());
    expect(mockToastError).toBeCalledTimes(1);
  });
});
