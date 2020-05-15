export interface RuntimeConfigItems {
  baseUrl: string;
  captchaRequired: boolean;
  captchaSiteKey: string;
}

declare global {
  interface Window {
    runtimeConfig: RuntimeConfigItems;
  }
}

const defaultConfig: RuntimeConfigItems = {
  baseUrl: "https://localhost:5001/v1",
  captchaRequired: true,
  captchaSiteKey: "6Le6BL0UAAAAAMjSs1nINeB5hqDZ4m3mMg3k67x3",
};

export class RuntimeConfig {
  private static _instance: RuntimeConfig;

  private constructor() {
    if (
      !window.hasOwnProperty("runtimeConfig") ||
      typeof window.runtimeConfig === "undefined"
    ) {
      window.runtimeConfig = defaultConfig;
    }
  }

  public static getInstance() {
    if (!this._instance) {
      this._instance = new RuntimeConfig();
    }
    return this._instance;
  }

  public baseUrl(): string {
    if (window.runtimeConfig.hasOwnProperty("baseUrl")) {
      return window.runtimeConfig.baseUrl;
    }
    return defaultConfig.baseUrl;
  }

  public captchaSiteKey(): string {
    if (window.runtimeConfig.hasOwnProperty("captchaSiteKey")) {
      return window.runtimeConfig.captchaSiteKey;
    }
    return defaultConfig.captchaSiteKey;
  }

  public captchaRequired(): boolean {
    if (window.runtimeConfig.hasOwnProperty("captchaRequired")) {
      return window.runtimeConfig.captchaRequired;
    }
    return defaultConfig.captchaRequired;
  }
}
