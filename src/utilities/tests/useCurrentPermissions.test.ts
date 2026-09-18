import { act, renderHook } from "@testing-library/react";

import { Permission } from "api/models";
import * as backend from "backend";
import { useAppSelector } from "rootRedux/hooks";
import { useCurrentPermissions } from "utilities/useCurrentPermissions";

jest.mock("backend", () => ({
  getCurrentPermissions: jest.fn(),
}));

jest.mock("rootRedux/hooks", () => ({
  useAppSelector: jest.fn(),
}));

const mockGetCurrentPermissions = backend.getCurrentPermissions as jest.Mock;
const mockUseAppSelector = useAppSelector as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useCurrentPermissions", () => {
  it("returns [] and does not fetch when no project selected", () => {
    mockUseAppSelector.mockReturnValue("");
    const { result } = renderHook(() => useCurrentPermissions());
    expect(result.current).toEqual([]);
    expect(mockGetCurrentPermissions).not.toHaveBeenCalled();
  });

  it("returns fetched permissions on success", async () => {
    const perms = [Permission.MergeAndReviewEntries];
    mockUseAppSelector.mockReturnValue("proj-id");
    mockGetCurrentPermissions.mockResolvedValue(perms);
    const { result } = renderHook(() => useCurrentPermissions());
    await act(async () => {});
    expect(result.current).toEqual(perms);
  });

  it("returns [] when fetch fails", async () => {
    mockUseAppSelector.mockReturnValue("proj-id");
    mockGetCurrentPermissions.mockRejectedValue(new Error("network error"));
    const { result } = renderHook(() => useCurrentPermissions());
    await act(async () => {});
    expect(result.current).toEqual([]);
  });

  it("clears permissions immediately when project changes", async () => {
    const perms = [Permission.MergeAndReviewEntries];
    mockUseAppSelector.mockReturnValue("proj-1");
    mockGetCurrentPermissions.mockResolvedValue(perms);
    const { result, rerender } = renderHook(() => useCurrentPermissions());
    await act(async () => {});
    expect(result.current).toEqual(perms);

    // Hang the next fetch so we can observe the cleared state
    mockGetCurrentPermissions.mockReturnValue(new Promise(() => {}));
    mockUseAppSelector.mockReturnValue("proj-2");
    await act(async () => {
      rerender();
    });
    expect(result.current).toEqual([]);
  });

  it("ignores stale fetch result after project change", async () => {
    let resolveStale!: (v: Permission[]) => void;
    const staleFetch = new Promise<Permission[]>(
      (resolve) => (resolveStale = resolve)
    );
    mockGetCurrentPermissions
      .mockReturnValueOnce(staleFetch)
      .mockResolvedValue([Permission.WordEntry]);

    mockUseAppSelector.mockReturnValue("proj-1");
    const { result, rerender } = renderHook(() => useCurrentPermissions());

    // Switch project before the first fetch resolves
    mockUseAppSelector.mockReturnValue("proj-2");
    await act(async () => {
      rerender();
    });
    // Second fetch resolved — should reflect proj-2 permissions
    expect(result.current).toEqual([Permission.WordEntry]);

    // Resolving the now-cancelled first fetch must not overwrite state
    await act(async () => {
      resolveStale([Permission.MergeAndReviewEntries]);
    });
    expect(result.current).toEqual([Permission.WordEntry]);
  });
});
