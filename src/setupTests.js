import "tests/reactI18nextMock";

// Force tests to fail on console.error and console.warn.
global.console.error = (message) => {
  throw message;
};
global.console.warn = (message) => {
  throw message;
};

// Mock the audio components
jest
  .spyOn(window.HTMLMediaElement.prototype, "pause")
  .mockImplementation(() => {});
jest.mock("components/Pronunciations/Recorder");

// Mock the browser router to short circuit a circular dependency
jest.mock("router/browserRouter", () => ({ navigate: jest.fn() }));
