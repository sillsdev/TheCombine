import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { SnackbarProvider } from "notistack";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";

import router from "browserRouter";
import "i18n";
import { persistor, store } from "store";
import theme from "types/theme";

//Provider connects store to component containers
ReactDOM.render(
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={theme}>
      <SnackbarProvider maxSnack={3} autoHideDuration={5000}>
        <Provider store={store}>
          <PersistGate persistor={persistor}>
            <RouterProvider router={router} />
          </PersistGate>
        </Provider>
      </SnackbarProvider>
    </ThemeProvider>
  </StyledEngineProvider>,
  document.getElementById("root")
);
