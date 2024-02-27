import {
  type TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from "react-redux";

import { type AppDispatch, type RootState } from "Redux/store";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
// `useAppDispatch` and `useAppSelector` apply the additional types for TypeScript
// that are introduced by added middleware, such as `thunk`
// See also https://redux-toolkit.js.org/tutorials/typescript#define-typed-hooks
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
