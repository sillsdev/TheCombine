import { type PreloadedState } from "@reduxjs/toolkit";
import { type RenderOptions, render } from "@testing-library/react";
import { type PropsWithChildren, type ReactElement } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { defaultState } from "components/App/DefaultState";
import {
  type AppStore,
  type RootState,
  persistor,
  setupStore,
} from "rootRedux/store";

/** This extends the default options for `render` from `@testing-library/react`,
 * allowing the user to specify other things such as `initialState`, `store`. */
interface ExtendedRenderOptions extends Omit<RenderOptions, "queries"> {
  preloadedState?: PreloadedState<RootState>;
  store?: AppStore;
}

/** This test utility is leveraged from the Redux documentation for Writing Tests:
 * https://redux.js.org/usage/writing-tests. Specifically, see the section on
 * "Integration Testing Connected Components and Redux Logic" */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {
      ...defaultState,
      _persist: { version: 0, rehydrated: false },
    },
    // Automatically create a store instance if no store was passed in
    store = setupStore(preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: PropsWithChildren<object>): JSX.Element {
    return (
      <Provider store={store}>
        <PersistGate persistor={persistor}>{children}</PersistGate>
      </Provider>
    );
  }

  // Return an object with the store and all of RTL's query functions
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
