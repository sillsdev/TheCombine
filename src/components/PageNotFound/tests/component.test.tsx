import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import "tests/mockReactI18next";

import PageNotFound from "components/PageNotFound/component";

const createMockStore = configureMockStore();

it("renders without crashing", () => {
  const mockStore = createMockStore();
  const div = document.createElement("div");
  ReactDOM.render(
    <Provider store={mockStore}>
      <PageNotFound />
    </Provider>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
