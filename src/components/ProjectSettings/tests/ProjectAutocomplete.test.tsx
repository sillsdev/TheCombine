import { Select } from "@mui/material";
import renderer from "react-test-renderer";

import { OffOnSetting } from "api/models";
import ProjectAutocomplete from "components/ProjectSettings/ProjectAutocomplete";
import { randomProject } from "types/project";

const mockSetProject = jest.fn();

const mockProject = randomProject();

let testRenderer: renderer.ReactTestRenderer;

const renderAutocomplete = async (): Promise<void> => {
  await renderer.act(async () => {
    testRenderer = renderer.create(
      <ProjectAutocomplete project={mockProject} setProject={mockSetProject} />
    );
  });
};

describe("ProjectAutocomplete", () => {
  it("updates project autocomplete", async () => {
    await renderAutocomplete();
    const selectChange = testRenderer.root.findByType(Select).props.onChange;
    await renderer.act(async () => selectChange({ target: { value: "Off" } }));
    expect(mockSetProject).toHaveBeenCalledWith({
      ...mockProject,
      autocompleteSetting: OffOnSetting.Off,
    });
    await renderer.act(async () => selectChange({ target: { value: "On" } }));
    expect(mockSetProject).toHaveBeenCalledWith({
      ...mockProject,
      autocompleteSetting: OffOnSetting.On,
    });
  });
});
