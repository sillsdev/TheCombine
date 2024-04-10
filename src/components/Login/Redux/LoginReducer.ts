import { createSlice } from "@reduxjs/toolkit";

import {
  LoginStatus,
  defaultState,
} from "components/Login/Redux/LoginReduxTypes";
import { StoreActionTypes } from "rootRedux/rootActions";

const loginSlice = createSlice({
  name: "loginState",
  initialState: defaultState,
  reducers: {
    setLoginAttemptAction: (state, action) => {
      state.error = "";
      state.loginStatus = LoginStatus.InProgress;
      state.signupStatus = LoginStatus.Default;
      state.username = action.payload;
    },
    setLoginFailureAction: (state, action) => {
      state.error = action.payload;
      state.loginStatus = LoginStatus.Failure;
    },
    setLoginSuccessAction: (state) => {
      state.loginStatus = LoginStatus.Success;
    },
    setSignupAttemptAction: (state, action) => {
      state.error = "";
      state.loginStatus = LoginStatus.Default;
      state.signupStatus = LoginStatus.InProgress;
      state.username = action.payload;
    },
    setSignupFailureAction: (state, action) => {
      state.error = action.payload;
      state.signupStatus = LoginStatus.Failure;
    },
    setSignupSuccessAction: (state) => {
      state.signupStatus = LoginStatus.Success;
    },
  },
  extraReducers: (builder) =>
    builder.addCase(StoreActionTypes.RESET, () => defaultState),
});

export const {
  setLoginAttemptAction,
  setLoginFailureAction,
  setLoginSuccessAction,
  setSignupAttemptAction,
  setSignupFailureAction,
  setSignupSuccessAction,
} = loginSlice.actions;

export default loginSlice.reducer;
