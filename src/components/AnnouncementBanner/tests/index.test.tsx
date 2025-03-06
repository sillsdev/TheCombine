import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

    // Confirm no banner by the absence of its close button
    expect(
      screen.queryByLabelText(AnnouncementBannerTextId.ButtonClose)
    ).toBeNull();
  });

  it("loads banner with text", async () => {
    await renderAnnouncementBanner(mockBannerText);

    // Confirm open banner by the presence of its close button and text
    expect(
      screen.queryByLabelText(AnnouncementBannerTextId.ButtonClose)
    ).not.toBeNull();
    expect(screen.queryByText(mockBannerText)).not.toBeNull();
  });

  it("closes when button is clicked", async () => {
    // Setup
    const agent = userEvent.setup();
    await renderAnnouncementBanner(mockBannerText);
    expect(screen.queryByText(mockBannerText)).not.toBeNull();

    // Click close button
    const closeButton = screen.getByLabelText(
      AnnouncementBannerTextId.ButtonClose
    );
    await agent.click(closeButton);

    // Confirm closed
    expect(
      screen.queryByLabelText(AnnouncementBannerTextId.ButtonClose)
    ).toBeNull();
    expect(screen.queryByText(mockBannerText)).toBeNull();
  });
});
