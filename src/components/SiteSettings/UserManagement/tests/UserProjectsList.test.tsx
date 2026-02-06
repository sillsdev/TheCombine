import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";

import { Role, UserProjectInfo } from "api/models";
import UserProjectsList from "components/SiteSettings/UserManagement/UserProjectsList";

jest.mock("backend", () => ({
  getUserProjects: (userId: string) => mockGetUserProjects(userId),
}));

const mockGetUserProjects = jest.fn();

const renderUserProjectsList = async (
  userId = "user-1",
  onLoaded?: jest.Mock
): Promise<void> => {
  await act(async () => {
    render(<UserProjectsList onLoaded={onLoaded} userId={userId} />);
  });
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("UserProjectsList", () => {
  it("renders nothing when no user id is provided", async () => {
    await renderUserProjectsList("");

    expect(mockGetUserProjects).not.toHaveBeenCalled();
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/no ?projects/i)).not.toBeInTheDocument();
  });

  it("shows loading state while projects are fetched", async () => {
    let resHolder: (value: UserProjectInfo[]) => void;
    const promise = new Promise<UserProjectInfo[]>((res) => {
      resHolder = res;
    });
    mockGetUserProjects.mockReturnValue(promise);

    await renderUserProjectsList("user-1");
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await act(async () => resHolder([]));
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

  it("shows a no-projects message when user has none", async () => {
    const onLoaded = jest.fn();
    mockGetUserProjects.mockResolvedValue([]);

    await renderUserProjectsList("user-2", onLoaded);

    expect(screen.getByText(/no ?projects/i)).toBeInTheDocument();
    expect(onLoaded).toHaveBeenCalledTimes(1);
  });

  it("renders project list with role labels", async () => {
    const projects: UserProjectInfo[] = [
      {
        projectId: "p1",
        projectIsActive: true,
        projectName: "Project Alpha",
        projectVernacular: "alp",
        role: Role.Editor,
      },
      {
        projectId: "p2",
        projectIsActive: false,
        projectName: "Project Beta",
        projectVernacular: "bet",
        role: Role.Owner,
      },
    ];
    mockGetUserProjects.mockResolvedValue(projects);

    await renderUserProjectsList("user-3");
    expect(
      screen.getByText("• Project Alpha (alp): projectSettings.roles.editor")
    ).toBeInTheDocument();
    expect(
      screen.getByText("• Project Beta (bet): projectSettings.roles.owner")
    ).toBeInTheDocument();
  });
});
