import { describe, it, expect } from "vitest";
import {
  normalizeEvent,
  normalizeEventWithPenalty,
  groupEventsByDay,
  getRelativeDayLabel,
  type TimelineEventRaw,
} from "@/lib/timeline";

describe("timeline", () => {
  describe("normalizeEvent", () => {
    it("normalizes a fumar (cigarette) event", () => {
      const raw: TimelineEventRaw = {
        id: "evt-1",
        type: "fumar",
        detail: JSON.stringify({
          cantidad: 1,
          cigarrillos_totales_hoy: 3,
          vidas_antes: 3,
          vidas_despues: 3,
          penalizacion: false,
        }),
        createdAt: new Date().toISOString(),
      };

      const result = normalizeEvent(raw);
      expect(result).not.toBeNull();
      expect(result!.type).toBe("cigarette");
      expect(result!.icon).toBe("fumar");
      expect(result!.color).toBe("orange");
      expect(result!.message).toContain("Fumaste 1 cigarro(s)");
      expect(result!.message).toContain("Total hoy: 3 de 5");
    });

    it("normalizes a respiracion positive action", () => {
      const raw: TimelineEventRaw = {
        id: "evt-2",
        type: "accion_positiva",
        detail: JSON.stringify({
          subtipos: "respiracion",
          duracion_segundos: 450,
          vidas_recuperadas: 0.5,
          vidas_totales_despues: 3.5,
        }),
        createdAt: new Date().toISOString(),
      };

      const result = normalizeEvent(raw);
      expect(result).not.toBeNull();
      expect(result!.type).toBe("positive_action");
      expect(result!.icon).toBe("respiracion");
      expect(result!.color).toBe("green");
      expect(result!.message).toContain("Respiración guiada completada");
      expect(result!.message).toContain("+0.5 vidas recuperadas");
    });

    it("normalizes a meditacion positive action", () => {
      const raw: TimelineEventRaw = {
        id: "evt-3",
        type: "accion_positiva",
        detail: JSON.stringify({
          subtipos: "meditacion",
          vidas_recuperadas: 0.5,
        }),
        createdAt: new Date().toISOString(),
      };

      const result = normalizeEvent(raw);
      expect(result).not.toBeNull();
      expect(result!.icon).toBe("meditacion");
      expect(result!.message).toContain("Meditación completada");
    });

    it("normalizes a musica positive action", () => {
      const raw: TimelineEventRaw = {
        id: "evt-4",
        type: "accion_positiva",
        detail: JSON.stringify({
          subtipos: "musica",
          vidas_recuperadas: 0.5,
        }),
        createdAt: new Date().toISOString(),
      };

      const result = normalizeEvent(raw);
      expect(result).not.toBeNull();
      expect(result!.icon).toBe("musica");
      expect(result!.message).toContain("Música de relajación completada");
    });

    it("returns null for unknown event type", () => {
      const raw: TimelineEventRaw = {
        id: "evt-5",
        type: "unknown_type",
        detail: null,
        createdAt: new Date().toISOString(),
      };

      const result = normalizeEvent(raw);
      expect(result).toBeNull();
    });

    it("handles null detail gracefully", () => {
      const raw: TimelineEventRaw = {
        id: "evt-6",
        type: "fumar",
        detail: null,
        createdAt: new Date().toISOString(),
      };

      const result = normalizeEvent(raw);
      expect(result).not.toBeNull();
      expect(result!.type).toBe("cigarette");
    });
  });

  describe("normalizeEventWithPenalty", () => {
    it("returns main event plus penalty when penalizacion is true", () => {
      const raw: TimelineEventRaw = {
        id: "evt-p1",
        type: "fumar",
        detail: JSON.stringify({
          cantidad: 1,
          cigarrillos_totales_hoy: 5,
          vidas_antes: 2,
          vidas_despues: 1,
          penalizacion: true,
        }),
        createdAt: new Date().toISOString(),
      };

      const results = normalizeEventWithPenalty(raw);
      expect(results).toHaveLength(2);
      expect(results[0].type).toBe("cigarette");
      expect(results[1].type).toBe("penalty");
      expect(results[1].icon).toBe("penalty");
      expect(results[1].color).toBe("red");
      expect(results[1].message).toContain("Perdiste 1 vida");
      expect(results[1].message).toContain("Te quedan 1 de 4");
    });

    it("returns only main event when penalizacion is false", () => {
      const raw: TimelineEventRaw = {
        id: "evt-p2",
        type: "fumar",
        detail: JSON.stringify({
          cantidad: 1,
          cigarrillos_totales_hoy: 2,
          penalizacion: false,
        }),
        createdAt: new Date().toISOString(),
      };

      const results = normalizeEventWithPenalty(raw);
      expect(results).toHaveLength(1);
      expect(results[0].type).toBe("cigarette");
    });

    it("returns empty array for unknown type", () => {
      const raw: TimelineEventRaw = {
        id: "evt-p3",
        type: "unknown",
        detail: null,
        createdAt: new Date().toISOString(),
      };

      const results = normalizeEventWithPenalty(raw);
      expect(results).toHaveLength(0);
    });
  });

  describe("groupEventsByDay", () => {
    it("groups events by date string", () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const events = [
        {
          id: "1",
          userId: "u1",
          type: "cigarette" as const,
          timestamp: today,
          data: {},
          message: "m1",
          icon: "fumar",
          color: "orange" as const,
        },
        {
          id: "2",
          userId: "u1",
          type: "cigarette" as const,
          timestamp: yesterday,
          data: {},
          message: "m2",
          icon: "fumar",
          color: "orange" as const,
        },
        {
          id: "3",
          userId: "u1",
          type: "positive_action" as const,
          timestamp: today,
          data: {},
          message: "m3",
          icon: "meditacion",
          color: "green" as const,
        },
      ];

      const grouped = groupEventsByDay(events);
      expect(grouped.size).toBe(2);

      const todayKey = today.toISOString().slice(0, 10);
      const yesterdayKey = yesterday.toISOString().slice(0, 10);

      expect(grouped.get(todayKey)).toHaveLength(2);
      expect(grouped.get(yesterdayKey)).toHaveLength(1);
    });

    it("returns empty map for empty input", () => {
      const grouped = groupEventsByDay([]);
      expect(grouped.size).toBe(0);
    });
  });

  describe("getRelativeDayLabel", () => {
    it("returns HOY for today", () => {
      expect(getRelativeDayLabel(new Date())).toBe("HOY");
    });

    it("returns AYER for yesterday", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(getRelativeDayLabel(yesterday)).toBe("AYER");
    });

    it("returns HACE N DÍAS for recent dates", () => {
      const date = new Date();
      date.setDate(date.getDate() - 3);
      expect(getRelativeDayLabel(date)).toBe("HACE 3 DÍAS");
    });

    it("returns formatted date for older dates", () => {
      const date = new Date();
      date.setDate(date.getDate() - 45);
      const label = getRelativeDayLabel(date);
      expect(label).not.toContain("HACE");
      expect(label).toMatch(/\d+ de \w+/);
    });
  });
});
