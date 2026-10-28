import { asyncCreateLexboxProject } from "components/ProjectScreen/CreateProjectActions";
import { newProject } from "types/project";
import { newWritingSystem } from "types/writingSystem";

jest.mock("backend", () => ({
  createProject: (...args: unknown[]) => mockCreateProject(...args),
  getProject: (...args: unknown[]) => mockGetProject(...args),
  importLexboxEntries: (...args: unknown[]) => mockImportLexboxEntries(...args),
}));
jest.mock("components/Project/ProjectActions", () => ({
  asyncSetNewCurrentProject: (...args: unknown[]) =>
    mockAsyncSetNewCurrentProject(...args),
}));
jest.mock("goals/Redux/GoalActions", () => ({}));
jest.mock("router/browserRouter", () => ({}));

const mockAsyncSetNewCurrentProject = jest.fn();
const mockCreateProject = jest.fn();
const mockGetProject = jest.fn();
const mockImportLexboxEntries = jest.fn();

const mockDispatch = jest.fn();
const projId = "proj-id";
const vern = newWritingSystem("es");

describe("asyncCreateLexboxProject", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateProject.mockResolvedValue({ ...newProject(), id: projId });
    mockGetProject.mockResolvedValue({ ...newProject(), id: projId });
  });

  it("creates the project, imports, then sets it as current", async () => {
    mockImportLexboxEntries.mockResolvedValue(2);

    await asyncCreateLexboxProject("name", vern, "lex-code", ["en"])(
      mockDispatch
    );

    expect(mockCreateProject.mock.calls[0][0]).toMatchObject({
      name: "name",
      vernacularWritingSystem: vern,
    });
    expect(mockImportLexboxEntries).toHaveBeenCalledWith(projId, "lex-code", [
      "en",
    ]);
    expect(mockAsyncSetNewCurrentProject).toHaveBeenCalledTimes(1);
  });

  it("rejects without setting the project if the import fails", async () => {
    mockImportLexboxEntries.mockRejectedValue(new Error("Import failed."));

    await expect(
      asyncCreateLexboxProject("name", vern, "lex-code", [])(mockDispatch)
    ).rejects.toThrow("Import failed.");
    expect(mockAsyncSetNewCurrentProject).not.toHaveBeenCalled();
  });
});
