import { ListItem } from "@material-ui/core";
import renderer, { ReactTestRenderer } from "react-test-renderer";

import ExportButton from "components/ProjectExport/ExportButton";
import ProjectButtonWithConfirmation from "components/SiteSettings/ProjectManagement/ProjectButtonWithConfirmation";
import { ProjectList } from "components/SiteSettings/ProjectManagement/ProjectManagement";
import { randomProject } from "types/project";

const mockProjects = [randomProject(), randomProject(), randomProject()];

jest.mock("components/ProjectExport/ExportButton");

var testRenderer: ReactTestRenderer;

beforeAll(() => {
  renderer.act(() => {
    testRenderer = renderer.create(ProjectList(mockProjects, [], jest.fn()));
  });
});

describe("ProjectList", () => {
  it("Has the right number of projects listed", () => {
    const projectList = testRenderer.root.findAllByType(ListItem);
    expect(projectList.length).toEqual(mockProjects.length);
  });

  it("Has the right number of export buttons", () => {
    const exportButtons = testRenderer.root.findAllByType(ExportButton);
    expect(exportButtons.length).toEqual(mockProjects.length);
  });

  it("Has the right number of archive/restore buttons", () => {
    const projectButtons = testRenderer.root.findAllByType(
      ProjectButtonWithConfirmation
    );
    expect(projectButtons.length).toEqual(mockProjects.length);
  });
});
