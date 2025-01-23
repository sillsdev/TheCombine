import { type Action, configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import { rootReducer } from "rootRedux/reducer";
import { type StoreState } from "rootRedux/types";

const persistConfig = { key: "root", storage };

const persistedReducer = persistReducer<StoreState, Action>(
  persistConfig,
  rootReducer
);

// In development and test, immutability check enabled for the Redux reducers
const immutableCheckConfig =
  process.env.NODE_ENV !== "production" ? { warnAfter: 1000 } : false;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const setupStore = (preloadedState?: RootState) => {
  return configureStore({
    reducer: persistedReducer,
    // for each of the default middleware items set to:
    //  - true to include with the default options
    //  - false to exclude
    //  - an object with specific options for the middleware
    //    see https://redux-toolkit.js.org/api/getDefaultMiddleware
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: true,
        immutableCheck: immutableCheckConfig,
        serializableCheck: false,
      }),
    devTools: process.env.NODE_ENV === "development",
    preloadedState,
  });
};

export const store: AppStore = setupStore();
export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof persistedReducer>;
export type AppStore = ReturnType<typeof setupStore>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
