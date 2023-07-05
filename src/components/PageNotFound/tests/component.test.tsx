import renderer from "react-test-renderer";

import "tests/reactI18nextMock";

import PageNotFound from "components/PageNotFound/component";

jest.mock("react-router-dom");

it("renders without crashing", () => {
  renderer.act(() => {
    renderer.create(<PageNotFound />);
  });
});
