import { format, isToday, isYesterday, differenceInDays } from "date-fns";
import { es, enUS } from "date-fns/locale";

export type TranslationFn = (key: string, params?: Record<string, any>) => string;

export type TimelineEventType =
  | "cigarette"
  | "positive_action"
  | "achievement"
  | "penalty"
  | "relapse_warning"
  | "milestone";

export interface TimelineEvent {
  id: string;
  userId: string;
  type: TimelineEventType;
  timestamp: Date;
  data: Record<string, any>;
  message: string;
  icon: string;
  color: "green" | "red" | "orange" | "blue" | "gold";
}

export type TimelineFilter = "today" | "week" | "month" | "all";

export interface TimelineEventRaw {
  id: string;
  type: string;
  detail: string | null;
  createdAt: string;
}

export function normalizeEvent(
  event: TimelineEventRaw,
  t?: TranslationFn
): TimelineEvent | null {
  const timestamp = new Date(event.createdAt);
  const detail: Record<string, any> = event.detail
    ? JSON.parse(event.detail)
    : {};

  switch (event.type) {
    case "fumar": {
      const { cantidad = 1, cigarrillos_totales_hoy = 1, penalizacion, vidas_despues } = detail;
      return {
        id: event.id,
        userId: "",
        type: "cigarette",
        timestamp,
        data: detail,
        message: t
          ? t("events.cigarette", { count: cantidad, total: cigarrillos_totales_hoy })
          : `Fumaste ${cantidad} cigarro(s). Total hoy: ${cigarrillos_totales_hoy} de 5`,
        icon: "🚬",
        color: "orange",
      };
    }

    case "accion_positiva": {
      const { subtipos, vidas_recuperadas = 0.5 } = detail;

      const subtipoConfig: Record<
        string,
        { icon: string; label: string; key: string }
      > = {
        respiracion: { icon: "🫁", label: "Respiración guiada completada", key: "events.breathing" },
        meditacion: { icon: "🧘", label: "Meditación completada", key: "events.meditation" },
        musica: { icon: "🎵", label: "Música de relajación completada", key: "events.music" },
      };

      const config = subtipoConfig[subtipos] || {
        icon: "✨",
        label: "Acción positiva completada",
        key: "events.positiveAction",
      };

      const labelText = t ? t(config.key) : config.label;
      const recoveredText = t
        ? t("events.livesRecovered", { count: vidas_recuperadas })
        : `+${vidas_recuperadas} vidas recuperadas`;

      return {
        id: event.id,
        userId: "",
        type: "positive_action",
        timestamp,
        data: detail,
        message: `${labelText}. ${recoveredText}`,
        icon: config.icon,
        color: "green",
      };
    }

    default:
      return null;
  }
}

export function normalizeEventWithPenalty(
  event: TimelineEventRaw,
  t?: TranslationFn
): TimelineEvent[] {
  const main = normalizeEvent(event, t);
  if (!main) return [];

  const result: TimelineEvent[] = [main];

  if (event.type === "fumar" && event.detail) {
    const detail = JSON.parse(event.detail);
    if (detail.penalizacion) {
      const penaltyMessage = t
        ? t("events.penalty", { remaining: detail.vidas_despues })
        : `Perdiste 1 vida. Te quedan ${detail.vidas_despues} de 4`;
      result.push({
        id: `${event.id}-penalty`,
        userId: "",
        type: "penalty",
        timestamp: new Date(event.createdAt),
        data: detail,
        message: penaltyMessage,
        icon: "⚠️",
        color: "red",
      });
    }
  }

  return result;
}

export function groupEventsByDay(
  events: TimelineEvent[]
): Map<string, TimelineEvent[]> {
  const groups = new Map<string, TimelineEvent[]>();

  for (const event of events) {
    const key = format(event.timestamp, "yyyy-MM-dd");
    const existing = groups.get(key) || [];
    existing.push(event);
    groups.set(key, existing);
  }

  const sorted = new Map(
    [...groups.entries()].sort(([a], [b]) => b.localeCompare(a))
  );

  return sorted;
}

export function getRelativeDayLabel(date: Date, locale: string = "es", t?: TranslationFn): string {
  const dateFnsLocale = locale === "en" ? enUS : es;

  if (isToday(date)) return t ? t("relativeDay.today") : (locale === "en" ? "TODAY" : "HOY");
  if (isYesterday(date)) return t ? t("relativeDay.yesterday") : (locale === "en" ? "YESTERDAY" : "AYER");

  const daysAgo = differenceInDays(new Date(), date);
  if (daysAgo <= 30) {
    return t
      ? t("relativeDay.daysAgo", { count: daysAgo })
      : (locale === "en" ? `${daysAgo} DAYS AGO` : `HACE ${daysAgo} DÍAS`);
  }

  return format(date, "d 'de' MMMM", { locale: dateFnsLocale });
}
