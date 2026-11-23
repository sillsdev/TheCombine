import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, type AxiosResponse } from "axios";
import { type ReactElement, useEffect } from "react";

import { LexboxImportBlocker, type LexboxProject } from "api/models";
import LexboxProjectsDialog from "components/Lexbox/LexboxProjectsDialog";

jest.mock("backend", () => ({
  getLexboxProjects: () => mockGetLexboxProjects(),
}));
jest.mock("components/Lexbox/LexboxLogin", () => mockLexboxLogin);

/** Stands in for LexboxLogin, reporting a logged-in user. */
function mockLexboxLogin(props: {
  onStatusChange?: (loggedIn: boolean) => void;
  reloadKey?: number;
}): ReactElement {
  useEffect(() => props.onStatusChange?.(true), []);
  useEffect(() => mockReloadKey(props.reloadKey), [props.reloadKey]);
  return <div />;
}

const mockGetLexboxProjects = jest.fn();
const mockReloadKey = jest.fn();

function rejectProjects(status: number, title: string): void {
  const response = { data: { title }, status } as AxiosResponse;
  mockGetLexboxProjects.mockRejectedValue(
    new AxiosError("Request failed", "ERR", undefined, undefined, response)
  );
}

async function renderDialog(): Promise<void> {
  await act(async () => {
    render(
      <LexboxProjectsDialog
        chooseProject={jest.fn()}
        onClose={jest.fn()}
        open
      />
    );
  });
}

const blockedProject: LexboxProject = {
  analysisWsTags: [],
  code: "blocked",
  id: "1",
  importBlocker: LexboxImportBlocker.NoVernacularLanguage,
  name: "Blocked",
  vernacularWsTags: [],
};
const importableProject: LexboxProject = {
  analysisWsTags: ["en"],
  code: "importable",
  id: "2",
  name: "Importable",
  vernacularWsTags: ["es"],
};

describe("LexboxProjectsDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetLexboxProjects.mockResolvedValue([
      blockedProject,
      importableProject,
    ]);
  });

  it("disables projects that can't be imported and lists them last", async () => {
    const chooseProject = jest.fn();

    await act(async () => {
      render(
        <LexboxProjectsDialog
          chooseProject={chooseProject}
          onClose={jest.fn()}
          open
        />
      );
    });

    const items = await screen.findAllByRole("button", { name: /\(.+\)/ });
    expect(items.map((i) => i.textContent)).toEqual([
      expect.stringContaining("Importable (importable)"),
      expect.stringContaining("Blocked (blocked)"),
    ]);
    expect(items[0]).not.toHaveAttribute("aria-disabled", "true");
    expect(items[1]).toHaveAttribute("aria-disabled", "true");
    expect(items[1]).toHaveTextContent("lexbox.blockerNoVernacularLanguage");

    await userEvent.click(items[0]);
    await userEvent.click(screen.getByRole("button", { name: /confirm/i }));

    expect(chooseProject).toHaveBeenCalledWith(importableProject);
  });

  it("shows the title of a problem-details error and reloads login status on 403", async () => {
    rejectProjects(403, "Not logged in to Lexbox");

    await renderDialog();

    expect(
      await screen.findByText("Not logged in to Lexbox")
    ).toBeInTheDocument();
    expect(mockReloadKey).toHaveBeenLastCalledWith(1);
  });

  it("doesn't reload login status on other errors", async () => {
    rejectProjects(502, "Lexbox projects request failed");

    await renderDialog();

    expect(
      await screen.findByText("Lexbox projects request failed")
    ).toBeInTheDocument();
    expect(mockReloadKey).toHaveBeenLastCalledWith(0);
  });
});
