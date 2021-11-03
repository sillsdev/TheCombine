import { ListItem } from "@material-ui/core";
import { Provider } from "react-redux";
import renderer, { ReactTestRenderer } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { defaultState } from "components/App/DefaultState";
import ExportButton from "components/ProjectExport/ExportButton";
import ProjectButtonWithConfirmation from "components/SiteSettings/ProjectManagement/ProjectButtonWithConfirmation";
import ProjectManagement from "components/SiteSettings/ProjectManagement/ProjectManagement";
import { randomProject } from "types/project";

const mockProjects = [randomProject(), randomProject(), randomProject()];

jest.mock("backend", () => ({
  getAllProjects: jest.fn(() => Promise.resolve(mockProjects)),
}));

var testRenderer: ReactTestRenderer;
const mockStore = configureMockStore()(defaultState);

beforeAll(() => {
  renderer.act(() => {
    testRenderer = renderer.create(
      <Provider store={mockStore}>
        <ProjectManagement />
      </Provider>
    );
  });
});

describe("ProjectManagement", () => {
  it("Has the right number of projects listed", () => {
    let projectList = testRenderer.root.findAllByType(ListItem);
    expect(projectList.length).toEqual(mockProjects.length);
  });

  it("Has the right number of export buttons", () => {
    let exportButtons = testRenderer.root.findAllByType(ExportButton);
    expect(exportButtons.length).toEqual(mockProjects.length);
  });

  it("Has the right number of archive/restore buttons", () => {
    let projectButtons = testRenderer.root.findAllByType(
      ProjectButtonWithConfirmation
    );
    expect(projectButtons.length).toEqual(mockProjects.length);
  });
});
