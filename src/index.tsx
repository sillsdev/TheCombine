//external modules
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { renderToStaticMarkup } from "react-dom/server";

//TC modules
import App from "./components/App/";
import * as serviceWorker from "./serviceWorker";
import { store } from "./store";
import { LocalizeProvider } from "react-localize-redux";

//additional files
import globalTranslations from "./resources/translations.json";

const localizeInit = {
  languages: [{ name: "English", code: "en" }, { name: "Spanish", code: "es" }],
  translation: globalTranslations,
  options: { renderToStaticMarkup }
};

//Provider connects store to component containers
ReactDOM.render(
  <Provider store={store}>
    <LocalizeProvider store={store} initialize={localizeInit}>
      <App />
    </LocalizeProvider>
  </Provider>,
  document.getElementById("root")
);

// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
