import { act, render, screen } from "@testing-library/react";

import ProjectImport, {
  ProjectImportTextId,
} from "components/ProjectSettings/ProjectImport";
import { randomProject } from "types/project";

const renderImport = async (lexboxProjectCode?: string): Promise<void> => {
  const project = { ...randomProject(), lexboxProjectCode };
  await act(async () => {
    render(<ProjectImport project={project} setProject={jest.fn()} />);
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

  it("renders only a note for a project imported from Lexbox", async () => {
    await renderImport("lexbox-code");
    expect(screen.getByText(ProjectImportTextId.LexboxImported)).toBeTruthy();
    expect(screen.queryByText(ProjectImportTextId.ButtonChoose)).toBeNull();
    expect(screen.queryByText(ProjectImportTextId.ButtonUpload)).toBeNull();
  });
});
