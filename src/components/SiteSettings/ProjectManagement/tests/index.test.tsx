import { ListItem } from "@mui/material";
import renderer from "react-test-renderer";

import "tests/reactI18nextMock";

import ExportButton from "components/ProjectExport/ExportButton";
import { ProjectList } from "components/SiteSettings/ProjectManagement";
import ProjectButtonWithConfirmation from "components/SiteSettings/ProjectManagement/ProjectButtonWithConfirmation";
import ProjectUsersButtonWithConfirmation from "components/SiteSettings/ProjectManagement/ProjectUsersButtonWithConfirmation";
import { randomProject } from "types/project";

const mockProjects = [randomProject(), randomProject(), randomProject()];

jest.mock("components/ProjectExport/ExportButton", () => "div");

let testRenderer: renderer.ReactTestRenderer;

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

  it("Has the right number of project roles buttons", () => {
    const projectButtons = testRenderer.root.findAllByType(
      ProjectUsersButtonWithConfirmation
    );
    expect(projectButtons.length).toEqual(mockProjects.length);
  });
});
