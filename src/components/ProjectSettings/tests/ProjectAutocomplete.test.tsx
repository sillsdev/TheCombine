import { Select } from "@mui/material";
import { type ReactTestRenderer, act, create } from "react-test-renderer";

import "tests/reactI18nextMock";

import { AutocompleteSetting } from "api/models";
import ProjectAutocomplete from "components/ProjectSettings/ProjectAutocomplete";
import { randomProject } from "types/project";

const mockSetProject = jest.fn();

const mockProject = randomProject();

let testRenderer: ReactTestRenderer;

const renderAutocomplete = async (): Promise<void> => {
  await act(async () => {
    testRenderer = create(
      <ProjectAutocomplete project={mockProject} setProject={mockSetProject} />
    );
  });
};

describe("ProjectAutocomplete", () => {
  it("updates project autocomplete", async () => {
    await renderAutocomplete();
    const selectChange = testRenderer.root.findByType(Select).props.onChange;
    await act(async () => selectChange({ target: { value: "Off" } }));
    expect(mockSetProject).toHaveBeenCalledWith({
      ...mockProject,
      autocompleteSetting: AutocompleteSetting.Off,
    });
    await act(async () => selectChange({ target: { value: "On" } }));
    expect(mockSetProject).toHaveBeenCalledWith({
      ...mockProject,
      autocompleteSetting: AutocompleteSetting.On,
    });
  });
});
