import { createStore, applyMiddleware, Middleware, Dispatch } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import { rootReducer } from "./rootReducer";

const persistConfig = {
  key: "root",
  storage,
};

//https://redux.js.org/recipes/configuring-your-store#extending-redux-functionality
//https://redux.js.org/tutorials/fundamentals/part-4-store#middleware
//https://stackoverflow.com/a/51845127
//https://gist.github.com/markerikson/3df1cf5abbac57820a20059287b4be58
const createMySocketMiddleware: Middleware = (store: any) => (
  next: Dispatch
) => (action: any) => {
  switch (action.type) {
    case "LOGIN_SUCCESS": {
      console.log("Logged in!");
    }
  }

  return next(action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
const middlewareEnhancer = applyMiddleware(thunk, createMySocketMiddleware);

export const store = createStore(
  persistedReducer,
  composeWithDevTools(middlewareEnhancer)
);
export const persistor = persistStore(store);
