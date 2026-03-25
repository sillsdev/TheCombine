import { TextEncoder, TextDecoder } from "util";

import "i18n/tests/reactI18nextMock";

// Force tests to fail on console.error and console.warn
global.console.error = (message) => {
  throw message;
};
global.console.warn = (message) => {
  throw message;
};

// Fix "ReferenceError: TextEncoder is not defined" issue with react-router v7
// https://stackoverflow.com/a/79332264/10210583
// https://remarkablemark.org/blog/2025/02/02/fix-jest-errors-in-react-router-7-upgrade/
global.TextDecoder ||= TextDecoder;
global.TextEncoder ||= TextEncoder;

// Mock all permissions as granted
Object.defineProperty(navigator, "permissions", {
  get() {
    return { query: () => Promise.resolve({ state: "granted" }) };
  },
});

// Mock toast
jest.mock("react-toastify", () => ({
  ToastContainer: () => null,
  toast: {
    error: jest.fn(),
    info: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
  },
}));

// Mock the audio components
jest
  .spyOn(window.HTMLMediaElement.prototype, "pause")
  .mockImplementation(() => {});
jest.mock("components/Pronunciations/Recorder", () => ({
  __esModule: true,
  default: class MockRecorder {
    static blobType = "audio";
    getRecordingId = jest.fn(() => undefined);
    startRecording = jest.fn(() => true);
    stopRecording = jest.fn(() => Promise.resolve(undefined));
  },
}));

// Mock the router to short circuit a circular dependency
jest.mock("router/browserRouter", () => ({ navigate: jest.fn() }));
