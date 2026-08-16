import { vi } from "vitest";

/**
 * Mock for next-intl's useTranslations hook.
 * Returns a function that looks up keys from the provided translations map.
 */
export function mockUseTranslations(translations: Record<string, string>) {
  return (key: string, params?: Record<string, string | number>) => {
    let value = translations[key] || key;
    if (params) {
      for (const [param, val] of Object.entries(params)) {
        value = value.replace(`{${param}}`, String(val));
      }
    }
    return value;
  };
}

/**
 * Mock for next-intl's useLocale hook.
 */
export function mockUseLocale(locale: string = "es") {
  return () => locale;
}

/**
 * Setup next-intl mocks for a test file.
 */
export function setupNextIntlMocks(options?: {
  translations?: Record<string, string>;
  locale?: string;
}) {
  const translations = options?.translations ?? {};
  const locale = options?.locale ?? "es";

  vi.mock("next-intl", () => ({
    useTranslations: () => mockUseTranslations(translations),
    useLocale: () => locale,
    useFormatter: () => ({
      number: (value: number) => String(value),
      dateTime: (value: Date) => value.toISOString(),
    }),
  }));
}
