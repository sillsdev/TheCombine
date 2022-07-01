import ThemeProvider from "@material-ui/styles/ThemeProvider";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { Router } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";

import history from "browserHistory";
import App from "components/App/component";
import "i18n";
import { persistor, store } from "store";
import theme from "types/theme";

//Provider connects store to component containers
ReactDOM.render(
  <ThemeProvider theme={theme}>
    <Provider store={store}>
      <Router history={history}>
        <PersistGate persistor={persistor}>
          <App />
        </PersistGate>
      </Router>
    </Provider>
  </ThemeProvider>,
  document.getElementById("root")
);
