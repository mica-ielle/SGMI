interface ApiSettings {
  baseUrl: string;
  timeout: number;
  port: number;
}

interface AppSettings {
  api: ApiSettings;
  theme: "light" | "dark" | "system";
  language: "fr" | "en";
}

const DEFAULT_SETTINGS: AppSettings = {
  api: {
    baseUrl: "http://localhost",
    port: 8421,
    timeout: 10000,
  },
  theme: "system",
  language: "fr",
};

export class SettingsService {
  private static readonly STORAGE_KEY = "camgaz_settings";

  getSettings(): AppSettings {
    try {
      const saved = localStorage.getItem(
        SettingsService.STORAGE_KEY,
      );
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.error(
        "Erreur lors du chargement des paramètres:",
        error,
      );
    }
    return DEFAULT_SETTINGS;
  }

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(
        SettingsService.STORAGE_KEY,
        JSON.stringify(settings),
      );
      // Notifier les autres composants du changement
      window.dispatchEvent(
        new CustomEvent("settings-changed", {
          detail: settings,
        }),
      );
    } catch (error) {
      console.error(
        "Erreur lors de la sauvegarde des paramètres:",
        error,
      );
      throw error;
    }
  }

  getApiBaseUrl(): string {
    const settings = this.getSettings();
    return `${settings.api.baseUrl}:${settings.api.port}`;
  }

  async testConnection(): Promise<{
    success: boolean;
    message: string;
    responseTime?: number;
  }> {
    const startTime = Date.now();
    const baseUrl = this.getApiBaseUrl();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        5000,
      );

      const response = await fetch(`${baseUrl}/health`, {
        method: "GET",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      if (response.ok) {
        return {
          success: true,
          message: "Connexion réussie",
          responseTime,
        };
      } else {
        return {
          success: false,
          message: `Erreur HTTP: ${response.status} ${response.statusText}`,
          responseTime,
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          return {
            success: false,
            message:
              "Timeout: La connexion a pris trop de temps",
            responseTime,
          };
        }
        return {
          success: false,
          message: `Erreur de connexion: ${error.message}  ${error.cause}`,
          responseTime,
        };
      }

      return {
        success: false,
        message: "Erreur de connexion inconnue",
        responseTime,
      };
    }
  }

  resetToDefaults(): AppSettings {
    this.saveSettings(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }
}

export const settingsService = new SettingsService();