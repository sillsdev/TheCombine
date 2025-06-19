import { act, render } from "@testing-library/react";

import PageNotFound from "components/PageNotFound/component";

jest.mock("react-router");

it("renders without crashing", () => {
  act(() => {
    render(<PageNotFound />);
  });
});
