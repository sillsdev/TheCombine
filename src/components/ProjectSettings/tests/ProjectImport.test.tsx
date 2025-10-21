import { act, render, screen } from "@testing-library/react";

import ProjectImport, {
  ProjectImportTextId,
} from "components/ProjectSettings/ProjectImport";
import { randomProject } from "types/project";

const renderImport = async (): Promise<void> => {
  await act(async () => {
    render(<ProjectImport project={randomProject()} setProject={jest.fn()} />);
  });
};

describe("ProjectImport", () => {
  it("renders with file select button and disabled upload button", async () => {
    await renderImport();
    const fileButton = screen.getByText(ProjectImportTextId.ButtonChoose);
    expect(fileButton.classList.toString()).not.toContain("Mui-disabled");
    const uploadButton = screen.getByText(ProjectImportTextId.ButtonUpload);
    expect(uploadButton.classList.toString()).toContain("Mui-disabled");
  });
});
