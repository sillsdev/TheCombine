interface RuntimeConfigItems {
  baseUrl: string;
  captchaRequired: boolean;
  captchaSiteKey: string;
  offline: boolean;
  emailServicesEnabled: boolean;
  showCertExpiration: boolean;
}

declare global {
  interface Window {
    runtimeConfig: RuntimeConfigItems;
    release: string;
  }
}

const defaultConfig: RuntimeConfigItems = {
  baseUrl: "http://localhost:5000",
  captchaRequired: true,
  /* https://developers.cloudflare.com/turnstile/troubleshooting/testing/
   * has dummy site keys for development and testing; options are:
   * invisible pass, invisible fail, visible pass, visible fail, forced interaction */
  captchaSiteKey: "1x00000000000000000000AA", // visible pass
  offline: false,
  emailServicesEnabled: true,
  showCertExpiration: true,
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

  public static getInstance(): RuntimeConfig {
    if (!this._instance) {
      this._instance = new RuntimeConfig();
    }
    return this._instance;
  }

  public baseUrl(): string {
    if (window.runtimeConfig.hasOwnProperty("useConnectionBaseUrlForApi")) {
      return `${window.location.protocol}//${window.location.host}`;
    }
    return defaultConfig.baseUrl;
  }

  public appRelease(): string {
    if (window.hasOwnProperty("release")) {
      return window.release;
    }
    return "v0.0.0-default.0";
  }

  public captchaRequired(): boolean {
    if (window.runtimeConfig.hasOwnProperty("captchaRequired")) {
      return window.runtimeConfig.captchaRequired;
    }
    return defaultConfig.captchaRequired;
  }

  public captchaSiteKey(): string {
    if (window.runtimeConfig.hasOwnProperty("captchaSiteKey")) {
      return window.runtimeConfig.captchaSiteKey;
    }
    return defaultConfig.captchaSiteKey;
  }

  public emailServicesEnabled(): boolean {
    if (RuntimeConfig._instance.isOffline()) {
      return false;
    }
    if (window.runtimeConfig.hasOwnProperty("emailServicesEnabled")) {
      return window.runtimeConfig.emailServicesEnabled;
    }
    return defaultConfig.emailServicesEnabled;
  }

  public isOffline(): boolean {
    if (window.runtimeConfig.hasOwnProperty("offline")) {
      return window.runtimeConfig.offline;
    }
    return defaultConfig.offline;
  }

  public showCertExpiration(): boolean {
    if (window.runtimeConfig.hasOwnProperty("showCertExpiration")) {
      return window.runtimeConfig.showCertExpiration;
    }
    return defaultConfig.showCertExpiration;
  }
}
