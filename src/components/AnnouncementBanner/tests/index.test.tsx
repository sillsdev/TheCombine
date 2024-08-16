import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { Provider } from "react-redux";
import createMockStore from "redux-mock-store";

import AnnouncementBanner, {
  AnnouncementBannerTextId,
} from "components/AnnouncementBanner";
import { defaultState } from "rootRedux/types";

jest.mock("backend", () => ({
  getBannerText: () => mockGetBannerText(),
}));

const mockBannerText = "I'm a banner!";
const mockGetBannerText = jest.fn();
const mockStore = createMockStore()(defaultState);

const renderAnnouncementBanner = async (bannerText?: string): Promise<void> => {
  mockGetBannerText.mockResolvedValue(bannerText ?? "");
  await act(async () => {
    render(
      <Provider store={mockStore}>
        <AnnouncementBanner />
      </Provider>
    );
  });
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("AnnouncementBanner", () => {
  it("doesn't load if no banner text", async () => {
    await renderAnnouncementBanner();
    expect(
      screen.queryByTitle(AnnouncementBannerTextId.ButtonClose)
    ).toBeNull();
  });

  it("loads banner with text", async () => {
    await renderAnnouncementBanner(mockBannerText);
    expect(screen.queryByText(mockBannerText)).not.toBeNull();
  });

  it("has button to close banner", async () => {
    // Setup
    const agent = userEvent.setup();
    await renderAnnouncementBanner(mockBannerText);

    // Find and click close button
    const closeButton = await screen.findByTitle(
      AnnouncementBannerTextId.ButtonClose
    );
    await agent.click(closeButton);

    // Confirm closed
    expect(screen.queryByText(mockBannerText)).toBeNull();
    expect(
      screen.queryByTitle(AnnouncementBannerTextId.ButtonClose)
    ).toBeNull();
  });
});
