// Force tests to fail on console.error and console.warn.
global.console.error = (message) => {
  throw message;
};
global.console.warn = (message) => {
  throw message;
};
