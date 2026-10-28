import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
}): ReactElement {
  useEffect(() => props.onStatusChange?.(true), []);
  return <div />;
}

const mockGetLexboxProjects = jest.fn();

const blockedProject: LexboxProject = {
  analysisWsTags: [],
  code: "blocked",
  id: "1",
  importBlocker: LexboxImportBlocker.InsufficientRole,
  name: "Blocked",
  vernacularWsTags: ["es"],
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
    expect(items[1]).toHaveTextContent(/Manager or Editor/);

    await userEvent.click(items[0]);
    await userEvent.click(screen.getByRole("button", { name: /confirm/i }));

    expect(chooseProject).toHaveBeenCalledWith(importableProject);
  });
});
