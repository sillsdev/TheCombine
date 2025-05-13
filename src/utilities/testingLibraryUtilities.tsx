import { type RenderOptions, render } from "@testing-library/react";
import { match } from "css-mediaquery";
import { type PropsWithChildren, type ReactElement } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import {
  type AppStore,
  type RootState,
  persistor,
  setupStore,
} from "rootRedux/store";
import { persistedDefaultState } from "rootRedux/testTypes";

/** This extends the default options for `render` from `@testing-library/react`,
 * allowing the user to specify other things such as `initialState`, `store`. */
interface ExtendedRenderOptions extends Omit<RenderOptions, "queries"> {
  preloadedState?: RootState;
  store?: AppStore;
}

/** This test utility is leveraged from the Redux documentation for Writing Tests:
 * https://redux.js.org/usage/writing-tests. Specifically, see the section on
 * "Integration Testing Connected Components and Redux Logic" */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = persistedDefaultState,
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

/** Call before rendering to allow `useMediaQuery` to work.
 *  (Also need components wrapped in a `<ThemeProvider>`.)
 *  Modified from mui.com/material-ui/react-use-media-query/#testing */
export function setMatchMedia(width?: number): void {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: match(query, { width: width ?? window.innerWidth }),
      addEventListener: jest.fn(),
      addListener: jest.fn(),
      removeEventListener: jest.fn(),
      removeListener: jest.fn(),
    }) as any;
}
