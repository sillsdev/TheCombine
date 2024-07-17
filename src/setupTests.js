import "tests/reactI18nextMock";

// Force tests to fail on console.error and console.warn.
global.console.error = (message) => {
  throw message;
};
global.console.warn = (message) => {
  throw message;
};

// Mock all permissions as granted
Object.defineProperty(navigator, "permissions", {
  get() {
    return { query: () => Promise.resolve({ state: "granted" }) };
  },
});

// Mock the audio components
jest
  .spyOn(window.HTMLMediaElement.prototype, "pause")
  .mockImplementation(() => {});
jest.mock("components/Pronunciations/RecorderContext", () => ({}));
