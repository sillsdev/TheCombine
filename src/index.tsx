import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { renderToStaticMarkup } from "react-dom/server";
import { LocalizeProvider } from "react-localize-redux";
import { Router } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import ThemeProvider from "@material-ui/styles/ThemeProvider";

import history from "browserHistory";
import App from "components/App/component";
import globalTranslations from "resources/translations.json";
import { store, persistor } from "store";
import theme from "types/theme";

const localizedLanguages = [
  { name: "English", code: "en" },
  { name: "Spanish", code: "es" },
  { name: "French", code: "fr" },
];
const localizedTags = localizedLanguages.map((l) => l.code);
const getPrimarySubtag = (bcp: string) => bcp.split("-")[0];
const getLocalizedLanguage = (bcp: string) =>
  localizedTags.includes(getPrimarySubtag(bcp)) ? getPrimarySubtag(bcp) : "en";
const localizeInit = {
  languages: localizedLanguages,
  translation: globalTranslations,
  options: {
    renderToStaticMarkup,
    defaultLanguage: getLocalizedLanguage(navigator.language),
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
