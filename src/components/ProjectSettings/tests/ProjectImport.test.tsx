import renderer from "react-test-renderer";

import "localization/mocks/reactI18nextMock";

import { FileInputButton } from "components/Buttons";
import ProjectImport, {
  uploadFileButtonId,
} from "components/ProjectSettings/ProjectImport";
import { randomProject } from "types/project";

const mockSetProject = jest.fn();

const mockProject = randomProject();

let testRenderer: renderer.ReactTestRenderer;
let uploadButton: renderer.ReactTestInstance;

const renderImport = async (): Promise<void> => {
  await renderer.act(async () => {
    testRenderer = renderer.create(
      <ProjectImport project={mockProject} setProject={mockSetProject} />
    );
  });
  uploadButton = testRenderer.root.findByProps({ id: uploadFileButtonId });
};

describe("ProjectImport", () => {
  it("upload button disabled when no file selected", async () => {
    await renderImport();
    expect(uploadButton.props.disabled).toBeTruthy();
  });

  it("upload button enabled when file selected", async () => {
    await renderImport();
    const selectButton = testRenderer.root.findByType(FileInputButton);
    const mockFile = { name: "name-of-a.file" } as File;
    await renderer.act(async () => selectButton.props.updateFile(mockFile));
    expect(uploadButton.props.disabled).toBeFalsy();
  });
});
