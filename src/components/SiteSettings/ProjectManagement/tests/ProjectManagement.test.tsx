import { ListItem } from "@material-ui/core";
import React from "react";
import { Provider } from "react-redux";
import renderer, { ReactTestRenderer } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { randomProject } from "../../../../types/project";
import { defaultState } from "../../../App/DefaultState";
import ExportProjectButton from "../../../ProjectSettings/ProjectExport/ExportProjectButton";
import ArchiveProjectButton from "../ArchiveProjectButton";
import ProjectManagement from "../ProjectManagement";
import RestoreProjectButton from "../RestoreProjectButton";

const mockProjects = [randomProject(), randomProject(), randomProject()];

jest.mock("../../../../backend", () => {
  return {
    getAllProjects: jest.fn(() => {
      return Promise.resolve(mockProjects);
    }),
  };
});

var testRenderer: ReactTestRenderer;
const createMockStore = configureMockStore([]);
const mockStore = createMockStore(defaultState);

beforeAll(() => {
  renderer.act(() => {
    testRenderer = renderer.create(
      <Provider store={mockStore}>
        <ProjectManagement />
      </Provider>
    );
  });
});

describe("Testing ProjectManagement component", () => {
  it("Has the right number of projects listed", () => {
    let projectList = testRenderer.root.findAllByType(ListItem);
    expect(projectList.length).toEqual(mockProjects.length);
  });

  it("Has the right number of export buttons", () => {
    let exportButtons = testRenderer.root.findAllByType(ExportProjectButton);
    expect(exportButtons.length).toEqual(mockProjects.length);
  });

  it("Has the right number of archive/restore buttons", () => {
    let archiveButtons = testRenderer.root.findAllByType(ArchiveProjectButton);
    let restoreButtons = testRenderer.root.findAllByType(RestoreProjectButton);
    expect(archiveButtons.length + restoreButtons.length).toEqual(
      mockProjects.length
    );
  });
});
