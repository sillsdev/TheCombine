import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ProjectName from "components/ProjectSettings/ProjectName";
import { randomProject } from "types/project";

jest.mock("react-toastify", () => ({
  toast: { error: () => mockToastError() },
}));

const mockToastError = jest.fn();
const mockSetProject = jest.fn();

const mockProject = randomProject();

const renderName = async (): Promise<void> => {
  await act(async () => {
    render(<ProjectName project={mockProject} setProject={mockSetProject} />);
  });
};

describe("ProjectName", () => {
  it("updates project name", async () => {
    await renderName();
    const textField = screen.getByRole("textbox");
    const saveButton = screen.getByRole("button");
    const name = "new-project-name";
    await userEvent.clear(textField);
    await userEvent.type(textField, name);
    mockSetProject.mockResolvedValueOnce({});
    await userEvent.click(saveButton);
    expect(mockSetProject).toHaveBeenCalledWith({ ...mockProject, name });
  });

  it("toasts on error", async () => {
    await renderName();
    const textField = screen.getByRole("textbox");
    const saveButton = screen.getByRole("button");
    await userEvent.clear(textField);
    await userEvent.type(textField, "whatever");
    mockSetProject.mockRejectedValueOnce({});
    expect(mockToastError).not.toHaveBeenCalled();
    await userEvent.click(saveButton);
    expect(mockToastError).toHaveBeenCalledTimes(1);
  });
});
