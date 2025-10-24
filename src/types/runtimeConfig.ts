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
    // Load runtime scripts dynamically
    this.loadRuntimeScript("/scripts/config.js", "runtimeConfig");
    this.loadRuntimeScript("/scripts/release.js", "release");

    if (
      !window.hasOwnProperty("runtimeConfig") ||
      typeof window.runtimeConfig === "undefined"
    ) {
      window.runtimeConfig = defaultConfig;
    }
  }

  /**
   * Dynamically loads a runtime script if the corresponding window property doesn't exist.
   * This is used to load configuration and other runtime scripts that are generated
   * at container startup time, bypassing Parcel's bundling process.
   *
   * @param src - The source URL of the script to load (e.g., "/scripts/config.js")
   * @param windowProperty - The window property name to check for existence (e.g., "runtimeConfig")
   */
  private loadRuntimeScript(src: string, windowProperty: string): void {
    if (!window.hasOwnProperty(windowProperty)) {
      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      document.head.appendChild(script);
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
