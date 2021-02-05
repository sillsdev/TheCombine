interface RuntimeConfigItems {
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
  baseUrl: "http://localhost:5000",
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
    // TODO: Remove support for previous configuration solution when
    //  Docker-based installation is used in production.
    if (window.runtimeConfig.hasOwnProperty("baseUrl")) {
      return window.runtimeConfig.baseUrl;
    }

    let baseUrl: string;
    if (window.runtimeConfig.hasOwnProperty("useConnectionBaseUrlForApi")) {
      baseUrl = `${window.location.protocol}//${window.location.host}`;
    } else {
      baseUrl = defaultConfig.baseUrl;
    }
    return baseUrl;
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
