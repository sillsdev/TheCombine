import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";

import Logo, { logoButtonLabel } from "components/AppBar/Logo";
import { Path } from "types/path";

jest.mock("react-router-dom", () => ({
  useNavigate:
    () =>
    (...args: any) =>
      mockNavigate(...args),
}));

const mockNavigate = jest.fn();

beforeAll(async () => {
  await act(async () => {
    render(<Logo />);
  });
});

describe("Logo", () => {
  it("navigates to Project Screen on click", async () => {
    const agent = userEvent.setup();
    await agent.click(screen.getByLabelText(logoButtonLabel));
    expect(mockNavigate).toHaveBeenCalledWith(Path.ProjScreen);
  });
});
