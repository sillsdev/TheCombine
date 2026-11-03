import { BroadcastChannel as NodeBroadcastChannel } from "worker_threads";

import { waitFor } from "@testing-library/react";

import {
  listenForLexboxLogin,
  notifyLexboxLogin,
} from "components/Lexbox/lexboxAuthChannel";

describe("lexboxAuthChannel", () => {
  describe("with BroadcastChannel", () => {
    // jsdom lacks BroadcastChannel, so use Node's.
    beforeAll(() => {
      Object.assign(globalThis, { BroadcastChannel: NodeBroadcastChannel });
    });

    afterAll(() => {
      Reflect.deleteProperty(globalThis, "BroadcastChannel");
    });

    // An open Node channel keeps Jest from exiting, so close them even if a test fails.
    let stopListening: () => void = () => {};
    afterEach(() => {
      stopListening();
      stopListening = () => {};
    });

    it("tells listeners about a login", async () => {
      const onLogin = jest.fn();
      stopListening = listenForLexboxLogin(onLogin);

      notifyLexboxLogin();

      await waitFor(() => expect(onLogin).toHaveBeenCalledTimes(1));
    });

    it("stops telling a listener after it stops listening", async () => {
      const onLoginStopped = jest.fn();
      const onLoginActive = jest.fn();
      listenForLexboxLogin(onLoginStopped)();
      stopListening = listenForLexboxLogin(onLoginActive);

      notifyLexboxLogin();

      await waitFor(() => expect(onLoginActive).toHaveBeenCalledTimes(1));
      expect(onLoginStopped).not.toHaveBeenCalled();
    });
  });

  describe("without BroadcastChannel", () => {
    it("does nothing", () => {
      expect(globalThis.BroadcastChannel).toBeUndefined();
      const onLogin = jest.fn();
      const stopListening = listenForLexboxLogin(onLogin);

      expect(() => notifyLexboxLogin()).not.toThrow();
      expect(() => stopListening()).not.toThrow();
      expect(onLogin).not.toHaveBeenCalled();
    });
  });
});
