//external modules
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { renderToStaticMarkup } from "react-dom/server";

//TC modules
import App from "./components/App/App";
import * as serviceWorker from "./serviceWorker";
import { store } from "./store";
import { LocalizeProvider } from "react-localize-redux";

//additional files
import globalTranslations from "./resources/translations.json";

import axios from "axios";

const localizeInit = {
  languages: [{ name: "English", code: "en" }, { name: "Spanish", code: "es" }],
  translation: globalTranslations,
  options: { renderToStaticMarkup }
};

var server = axios.create({
  baseURL: "https://localhost:5001/v1",
  timeout: 1000,
  headers: { "Content-Type": "application/json" }
});

server.post("/collection", { word: { vern: "test", gloss: "test2" } });

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
