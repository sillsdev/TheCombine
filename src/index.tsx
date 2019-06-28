//external modules
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { renderToStaticMarkup } from "react-dom/server";
import { ThemeProvider } from "@material-ui/styles";
import { CssBaseline } from "@material-ui/core";

//TC modules
import App from "./components/App/component";
import * as serviceWorker from "./serviceWorker";
import { store } from "./store";
import { LocalizeProvider } from "react-localize-redux";
import theme from "./types/theme";

//additional files
import globalTranslations from "./resources/translations.json";
import { Router } from "react-router-dom";
import history from "./history";

const localizeInit = {
  languages: [{ name: "English", code: "en" }, { name: "Spanish", code: "es" }],
  translation: globalTranslations,
  options: { renderToStaticMarkup }
};

//Provider connects store to component containers
ReactDOM.render(
  // <ThemeProvider theme={theme}>
  //   <CssBaseline />
  <Provider store={store}>
    <LocalizeProvider store={store} initialize={localizeInit}>
      <Router history={history}>
        <App />
      </Router>
    </LocalizeProvider>
  </Provider>,
  // </ThemeProvider>,
  document.getElementById("root")
);

// Learn more about service workers: https://developers.google.com/web/fundamentals/primers/service-workers/
// https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app
serviceWorker.register();
