import renderer from "react-test-renderer";

import PageNotFound from "components/PageNotFound/component";

jest.mock("react-router-dom");

it("renders without crashing", () => {
  renderer.act(() => {
    renderer.create(<PageNotFound />);
  });
});
