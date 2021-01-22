import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { renderToStaticMarkup } from "react-dom/server";
import { LocalizeProvider } from "react-localize-redux";
import { Router } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import ThemeProvider from "@material-ui/styles/ThemeProvider";

import App from "components/App/component";
import * as serviceWorker from "serviceWorker";
import { store, persistor } from "store";
import globalTranslations from "resources/translations.json";
import history from "browserHistory";
import theme from "types/theme";

const localizedLanguages = [
  { name: "English", code: "en" },
  { name: "Spanish", code: "es" },
  { name: "French", code: "fr" },
];

const localizeInit = {
  languages: localizedLanguages,
  translation: globalTranslations,
  options: {
    renderToStaticMarkup,
    defaultLanguage:
      localizedLanguages.find((l) => l.code === navigator.language) !==
      undefined
        ? navigator.language
        : "en",
  },
};

//Provider connects store to component containers
ReactDOM.render(
  <ThemeProvider theme={theme}>
    <Provider store={store}>
      <LocalizeProvider store={store} initialize={localizeInit}>
        <Router history={history}>
          <PersistGate loading={null} persistor={persistor}>
            <App />
          </PersistGate>
        </Router>
      </LocalizeProvider>
    </Provider>
  </ThemeProvider>,
  document.getElementById("root")
);

// Learn more about service workers: https://developers.google.com/web/fundamentals/primers/service-workers/
// https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app
serviceWorker.register();
