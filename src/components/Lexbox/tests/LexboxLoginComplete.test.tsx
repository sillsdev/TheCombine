import "@testing-library/jest-dom";
import { act, render } from "@testing-library/react";

import LexboxLoginComplete from "components/Lexbox/LexboxLoginComplete";

const mockNotifyLexboxLogin = jest.fn();

jest.mock("components/Lexbox/lexboxAuthChannel", () => ({
  notifyLexboxLogin: () => mockNotifyLexboxLogin(),
}));

describe("LexboxLoginComplete", () => {
  it("reports the login and closes the window", async () => {
    const close = jest.spyOn(window, "close").mockImplementation(() => {});

    await act(async () => {
      render(<LexboxLoginComplete />);
    });

    expect(mockNotifyLexboxLogin).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
    close.mockRestore();
  });
});
