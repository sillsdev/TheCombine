import { act, render, screen } from "@testing-library/react";

import MockBypassFileInputButton from "components/Buttons/FileInputButton";
import MockBypassLoadableButton from "components/Buttons/LoadingDoneButton";
import ProjectImport, {
  ProjectImportIds,
} from "components/ProjectSettings/ProjectImport";
import { randomProject } from "types/project";

jest.mock("components/Buttons", () => ({
  ...jest.requireActual("components/Buttons"),
  FileInputButton: MockBypassFileInputButton,
  LoadingDoneButton: MockBypassLoadableButton,
}));

const renderImport = async (): Promise<void> => {
  await act(async () => {
    render(<ProjectImport project={randomProject()} setProject={jest.fn()} />);
  });
};

describe("ProjectImport", () => {
  it("renders with file select button and disabled upload button", async () => {
    await renderImport();
    const fileButton = screen.getByTestId(ProjectImportIds.ButtonFileSelect);
    expect(fileButton.classList.toString()).not.toContain("Mui-disabled");
    const uploadButton = screen.getByTestId(ProjectImportIds.ButtonFileSubmit);
    expect(uploadButton.classList.toString()).toContain("Mui-disabled");
  });
});
