// Force tests to fail on console.error and console.warn.
global.console.error = (message) => {
  throw message;
};
global.console.warn = (message) => {
  throw message;
};

// https://github.com/testing-library/react-testing-library/issues/1061#issuecomment-1117450890
global.IS_REACT_ACT_ENVIRONMENT = true;
