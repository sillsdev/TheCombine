import { act, render, screen } from "@testing-library/react";

import DomainProgressBar from "components/TreeView/TreeDepiction/DomainProgressBar";

jest.mock("backend", () => ({
  getDomainProgressProportion: (id: string) =>
    mockGetDomainProgressProportion(id),
}));

const mockGetDomainProgressProportion = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

async function renderBar(domainId = "1.2"): Promise<void> {
  await act(async () => {
    render(<DomainProgressBar domainId={domainId} />);
  });
}

const getFillWidth = (): string =>
  getComputedStyle(screen.getByTestId("domain-progress-fill")).width;

describe("DomainProgressBar", () => {
  it("fills to the fetched proportion", async () => {
    mockGetDomainProgressProportion.mockResolvedValue(0.25);
    await renderBar("1.2");
    expect(mockGetDomainProgressProportion).toHaveBeenCalledWith("1.2");
    expect(getFillWidth()).toEqual("25%");
  });

  it("stays empty if the fetch fails", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    mockGetDomainProgressProportion.mockRejectedValue(new Error());
    await renderBar();
    expect(getFillWidth()).toEqual("0%");
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
