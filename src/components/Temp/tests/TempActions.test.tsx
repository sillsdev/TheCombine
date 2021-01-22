import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import axios from "axios";

import * as action from "components/Temp/TempActions";
import { defaultState } from "components/Temp/TempReducer";

// Create a mock redux store with the specified middlewares applied in
// an array (here, just thunk)
const createMockStore = configureMockStore([thunk]);

// Required to check-up on what our mock Axios did during function calls
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("TempAction Tests", () => {
  let mockState = {
    // Missing localize variable, but that's fine for our test
    tempState: {
      ...defaultState,
    },
  };
  let bP: action.ButtonPressed = {
    type: action.PRESS_BUTTON,
  };

  // Test whether pressButton returns a proper value
  test("pressButton returns correct value", () => {
    expect(action.pressButton()).toEqual(bP);
  });

  // Test whether asyncPressButton results in certain changes to state
  test("asyncButtonPress correctly affects state", () => {
    // Create a mock store to act on
    const mockStore = createMockStore(mockState);

    // This just simplifies syntax. dispatch asyncPressButton to mockStore
    // (<any> flag sidesteps type errors)
    const mockDispatch = mockStore.dispatch<any>(action.asyncPressButton());

    mockDispatch
      .then(() => {
        // Check what actions have been executed on the mockStore, and see if it is
        // equal to the array of actions provided (here, only one action is expected)
        expect(mockStore.getActions()).toEqual([bP]);

        // Inspect mockAxios/axios to determine what was called on it.
        // mockAxios.function.mocks.calls[X][Y]: Check the 'Y' parameter of the 'X'
        // call to function. For us, saying y=0 will let us check what route was called on post.
        expect(mockAxios.post).toHaveBeenCalled();
        expect(mockAxios.post.mock.calls[0][0]).toEqual("/words");
      })
      .catch(() => {
        console.error("Error: dispatch failed");
        fail();
      });
  });
});
