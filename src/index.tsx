import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { SnackbarProvider } from "notistack";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import "i18n";
import App from "components/App";
import { persistor, store } from "rootRedux/store";
import theme from "types/theme";

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={theme}>
      <SnackbarProvider maxSnack={3} autoHideDuration={5000}>
        <Provider store={store}>
          <PersistGate persistor={persistor}>
            <App />
          </PersistGate>
        </Provider>
      </SnackbarProvider>
    </ThemeProvider>
  </StyledEngineProvider>
);
