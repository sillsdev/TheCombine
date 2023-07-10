import { Select } from "@mui/material";
import renderer from "react-test-renderer";

import "tests/reactI18nextMock";

import { AutocompleteSetting } from "api/models";
import ProjectAutocomplete from "components/ProjectSettings/ProjectAutocomplete";
import { randomProject } from "types/project";

const mockUpdateProject = jest.fn();

const mockProject = randomProject();

let testRenderer: renderer.ReactTestRenderer;

const renderAutocomplete = async (): Promise<void> => {
  await renderer.act(async () => {
    testRenderer = renderer.create(
      <ProjectAutocomplete
        project={mockProject}
        updateProject={mockUpdateProject}
      />,
    );
  });
};

describe("ProjectAutocomplete", () => {
  it("updates project autocomplete", async () => {
    await renderAutocomplete();
    const selectChange = testRenderer.root.findByType(Select).props.onChange;
    await renderer.act(async () => selectChange({ target: { value: "Off" } }));
    expect(mockUpdateProject).toBeCalledWith({
      ...mockProject,
      autocompleteSetting: AutocompleteSetting.Off,
    });
    await renderer.act(async () => selectChange({ target: { value: "On" } }));
    expect(mockUpdateProject).toBeCalledWith({
      ...mockProject,
      autocompleteSetting: AutocompleteSetting.On,
    });
  });
});
