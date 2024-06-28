import "@testing-library/jest-dom";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";

import SiteSettings, { SiteSettingsTab } from "components/SiteSettings";

const mockGetAllProjects = jest.fn();
const mockGetAllUsers = jest.fn();
const mockGetBannerText = jest.fn();

jest.mock("backend", () => ({
  getAllProjects: (...args: any[]) => mockGetAllProjects(...args),
  getAllUsers: (...args: any[]) => mockGetAllUsers(...args),
  getBannerText: (...args: any[]) => mockGetBannerText(...args),
}));
jest.mock("components/Project/ProjectActions", () => ({}));

const setupMocks = (): void => {
  mockGetAllProjects.mockResolvedValue([]);
  mockGetAllUsers.mockResolvedValue([]);
  mockGetBannerText.mockResolvedValue("");
};

beforeEach(() => {
  jest.clearAllMocks();
  setupMocks();
});

afterEach(cleanup);

const renderSiteSettings = async (): Promise<void> => {
  await act(async () => {
    render(<SiteSettings />);
  });
};

const isPanelVisible = (tab: SiteSettingsTab): void => {
  const panels = screen.queryAllByRole("tabpanel");
  expect(panels).toHaveLength(1);
  expect(panels[0].id.includes(tab.toString()));
};

describe("SiteSettings", () => {
  it("renders with three tabs and the projects tab panel enabled", async () => {
    await renderSiteSettings();
    expect(screen.queryAllByRole("tab")).toHaveLength(3);
    isPanelVisible(SiteSettingsTab.Projects);
  });

  it("enables the correct panel when a button is clicked", async () => {
    const agent = userEvent.setup();
    await renderSiteSettings();

    // Banners tab
    await act(async () => {
      await agent.click(screen.getByTestId(SiteSettingsTab.Banners));
    });
    isPanelVisible(SiteSettingsTab.Banners);

    // Projects tab
    await act(async () => {
      await agent.click(screen.getByTestId(SiteSettingsTab.Projects));
    });
    isPanelVisible(SiteSettingsTab.Projects);

    // Users tab
    await act(async () => {
      await agent.click(screen.getByTestId(SiteSettingsTab.Users));
    });
    isPanelVisible(SiteSettingsTab.Users);
  });
});
