import ThemeProvider from "@material-ui/styles/ThemeProvider";
import ReactDOM from "react-dom";
import { renderToStaticMarkup } from "react-dom/server";
import {
  InitializePayload,
  LocalizeProvider,
  NamedLanguage,
} from "react-localize-redux";
import { Provider } from "react-redux";
import { Router } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";

import history from "browserHistory";
import App from "components/App/component";
import globalTranslations from "resources/translations.json";
import { persistor, store } from "store";
import theme from "types/theme";
import { defaultWritingSystem, uiWritingSystems } from "types/writingSystem";

const localizedLanguages: NamedLanguage[] = uiWritingSystems.map((ws) => ({
  name: ws.name,
  code: ws.bcp47,
}));

const localizedTags = localizedLanguages.map((l) => l.code);
const getPrimarySubtag = (bcp: string): string => bcp.split("-")[0];
const getLocalizedLanguage = (bcp: string): string =>
  localizedTags.includes(getPrimarySubtag(bcp))
    ? getPrimarySubtag(bcp)
    : defaultWritingSystem.bcp47;
const localizeInit: InitializePayload = {
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
          <PersistGate persistor={persistor}>
            <App />
          </PersistGate>
        </Router>
      </LocalizeProvider>
    </Provider>
  </ThemeProvider>,
  document.getElementById("root")
);
